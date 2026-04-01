import { openai } from '@ai-sdk/openai';
import { Output, streamText } from 'ai';
import { desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import {
  audienceGenreSummaries,
  audiences,
  creativeOutputs,
  genres,
  respondents,
  type Respondent,
} from '@/db/schema';
import { applyFilters } from '@/lib/filter-matching';
import { campaignSchema } from '@/lib/schemas/campaign-schema';
import { personaSchema } from '@/lib/schemas/persona-schema';
import { getAuthUser } from '@/lib/supabase/auth';
import type { CampaignContent, PersonaContent } from '@/types/creative';

export const maxDuration = 60;

const requestBodySchema = z.object({
  audience_id: z.string().uuid(),
  type: z.union([z.literal('persona'), z.literal('campaign')]),
});

function buildDemographicsSummary(respondentData: Respondent[]): string {
  if (respondentData.length === 0) {
    return 'No demographic data available.';
  }

  const count = respondentData.length;
  const avgAge = Math.round(respondentData.reduce((sum, r) => sum + r.age, 0) / count);

  const genderCounts = new Map<string, number>();
  for (const r of respondentData) {
    genderCounts.set(r.gender, (genderCounts.get(r.gender) ?? 0) + 1);
  }
  const genderBreakdown = Array.from(genderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([g, n]) => `${g}: ${Math.round((n / count) * 100)}%`)
    .join(', ');

  const regionCounts = new Map<string, number>();
  for (const r of respondentData) {
    regionCounts.set(r.region, (regionCounts.get(r.region) ?? 0) + 1);
  }
  const topRegions = Array.from(regionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([region]) => region)
    .join(', ');

  const avgIncome = Math.round(
    respondentData.reduce((sum, r) => sum + r.householdIncomeUsd, 0) / count,
  );

  return (
    `${count} respondents. Average age: ${avgAge}. ` +
    `Gender breakdown: ${genderBreakdown}. ` +
    `Top regions: ${topRegions}. ` +
    `Average household income: $${avgIncome.toLocaleString()}.`
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = requestBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { audience_id, type } = parsed.data;

  const [audience] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.id, audience_id));

  if (!audience) {
    return NextResponse.json({ error: 'Audience not found' }, { status: 404 });
  }

  if (audience.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [genreSummaryRows, allRespondents] = await Promise.all([
    db
      .select({
        genreName: genres.genreName,
        avgInterest: audienceGenreSummaries.avgInterest,
        pctHighlyInterested: audienceGenreSummaries.pctHighlyInterested,
      })
      .from(audienceGenreSummaries)
      .innerJoin(genres, eq(audienceGenreSummaries.genreSlug, genres.genreSlug))
      .where(eq(audienceGenreSummaries.audienceId, audience_id))
      .orderBy(desc(audienceGenreSummaries.avgInterest)),
    db.select().from(respondents),
  ]);

  const audienceRespondents = applyFilters({
    filters: audience.filters,
    manualIncludes: audience.manualIncludes,
    manualExcludes: audience.manualExcludes,
    respondents: allRespondents,
  });

  const demographicsSummary = buildDemographicsSummary(audienceRespondents);
  const topGenres = genreSummaryRows.slice(0, 10);

  const audienceContext = [
    `Audience name: ${audience.name}`,
    `Demographics: ${demographicsSummary}`,
    `Top genre interests (by average interest score 1-5):`,
    ...topGenres.map(
      (g) =>
        `- ${g.genreName}: avg interest ${parseFloat(g.avgInterest).toFixed(2)}, ` +
        `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% highly interested`,
    ),
  ].join('\n');

  const userId = auth.user.id;

  if (type === 'persona') {
    const result = streamText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: personaSchema }),
      system: [
        'You are an audience insights expert. Your task is to synthesize audience demographics and genre interests into a structured persona profile.',
        'Generate a realistic, specific, and actionable persona based on the provided audience data.',
        'The persona should feel like a real person who represents this audience segment.',
      ].join(' '),
      prompt: audienceContext,
      onFinish: async ({ text }) => {
        try {
          const parsedOutput = personaSchema.safeParse(JSON.parse(text));
          if (!parsedOutput.success) return;

          const content: PersonaContent = parsedOutput.data;

          await db.insert(creativeOutputs).values({
            userId,
            audienceId: audience_id,
            type: 'persona',
            content,
          });
        } catch {
          // Save failure does not affect streaming response
        }
      },
    });

    return result.toTextStreamResponse();
  }

  // type === 'campaign'
  const result = streamText({
    model: openai('gpt-4o-mini'),
    output: Output.object({ schema: campaignSchema }),
    system: [
      'You are a creative campaign strategist. Your task is to generate 3-5 campaign concepts tailored to a specific audience.',
      'Each concept must clearly leverage specific genres the audience cares about and be informed by their demographic profile.',
      'Make each concept distinct, creative, and actionable. Concepts should feel differentiated from each other.',
    ].join(' '),
    prompt: audienceContext,
    onFinish: async ({ text }) => {
      try {
        const parsedOutput = campaignSchema.safeParse(JSON.parse(text));
        if (!parsedOutput.success) return;

        const content: CampaignContent = parsedOutput.data;

        await db.insert(creativeOutputs).values({
          userId,
          audienceId: audience_id,
          type: 'campaign',
          content,
        });
      } catch {
        // Save failure does not affect streaming response
      }
    },
  });

  return result.toTextStreamResponse();
}
