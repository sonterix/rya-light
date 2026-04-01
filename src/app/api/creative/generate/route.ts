import { openai } from '@ai-sdk/openai';
import { Output, streamText } from 'ai';
import { and, desc, eq } from 'drizzle-orm';
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
import { messagingSchema } from '@/lib/schemas/messaging-schema';
import { opportunitySchema } from '@/lib/schemas/opportunity-schema';
import { personaSchema } from '@/lib/schemas/persona-schema';
import { getAuthUser } from '@/lib/supabase/auth';
import type { CampaignContent, MessagingContent, OpportunityContent, PersonaContent } from '@/types/creative';

export const maxDuration = 60;

const requestBodySchema = z.object({
  audience_id: z.string().uuid(),
  type: z.union([z.literal('persona'), z.literal('campaign'), z.literal('messaging'), z.literal('opportunity')]),
  output_id: z.string().uuid().optional(),
  existing_content: z.record(z.string(), z.unknown()).optional(),
  refinement_instruction: z.string().optional(),
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

const REFINEMENT_SYSTEM_SUFFIX = [
  'You are refining an existing creative output based on a specific instruction.',
  'You MUST only make changes that are relevant to the audience data and the creative output context.',
  'If the refinement instruction is unrelated to the audience, creative output, or marketing/content strategy,',
  'respond by returning the original content unchanged and include a note explaining you can only refine based on audience data.',
  'Always return a complete, valid JSON object matching the required schema.',
].join(' ');

function buildRefinementPrompt(
  audienceContext: string,
  existingContent: Record<string, unknown>,
  refinementInstruction: string,
): string {
  return [
    'AUDIENCE CONTEXT:',
    audienceContext,
    '',
    'EXISTING OUTPUT:',
    JSON.stringify(existingContent, null, 2),
    '',
    'REFINEMENT INSTRUCTION:',
    refinementInstruction,
  ].join('\n');
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

  const { audience_id, type, output_id, existing_content, refinement_instruction } = parsed.data;
  const isRefinementMode = existing_content !== undefined && refinement_instruction !== undefined;

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

  if (type === 'opportunity') {
    // Include all genres for gap analysis, highlighting low/neutral interest (avg <= 3)
    const lowAndNeutralGenres = genreSummaryRows.filter(
      (g) => parseFloat(g.avgInterest) <= 3,
    );
    const highInterestGenres = genreSummaryRows.filter(
      (g) => parseFloat(g.avgInterest) > 3,
    );

    const opportunityContext = [
      `Audience name: ${audience.name}`,
      `Demographics: ${demographicsSummary}`,
      `High-interest genres (avg interest > 3):`,
      ...highInterestGenres.slice(0, 10).map(
        (g) =>
          `- ${g.genreName}: avg interest ${parseFloat(g.avgInterest).toFixed(2)}, ` +
          `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% highly interested`,
      ),
      `Low/neutral-interest genres (avg interest <= 3, these are the gap opportunities):`,
      ...lowAndNeutralGenres.map(
        (g) =>
          `- ${g.genreName}: avg interest ${parseFloat(g.avgInterest).toFixed(2)}, ` +
          `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% highly interested`,
      ),
    ].join('\n');

    const opportunityBaseSystem = [
      'You are an audience insights strategist specializing in finding non-obvious content opportunities.',
      'Your task is to cross-reference an audience\'s demographic traits with genres they currently show low or neutral interest in.',
      'Identify where unexpected connections exist between who the audience is and what they\'re not yet engaging with.',
      'Each opportunity should clearly explain the gap genre, the specific audience trait that creates the opportunity, a creative crossover concept, and your reasoning.',
      'Focus on surprising but plausible bridges — not obvious recommendations.',
    ].join(' ');

    const opportunitySystem = isRefinementMode
      ? `${opportunityBaseSystem} ${REFINEMENT_SYSTEM_SUFFIX}`
      : opportunityBaseSystem;

    const opportunityPrompt = isRefinementMode
      ? buildRefinementPrompt(opportunityContext, existing_content, refinement_instruction)
      : opportunityContext;

    const opportunityResult = streamText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: opportunitySchema }),
      system: opportunitySystem,
      prompt: opportunityPrompt,
      onFinish: async ({ text }) => {
        try {
          const parsedOutput = opportunitySchema.safeParse(JSON.parse(text));
          if (!parsedOutput.success) return;

          const content: OpportunityContent = parsedOutput.data;

          if (output_id) {
            await db.update(creativeOutputs).set({ content, updatedAt: new Date() }).where(and(eq(creativeOutputs.id, output_id), eq(creativeOutputs.userId, userId)));
          } else {
            await db.insert(creativeOutputs).values({ userId, audienceId: audience_id, type: 'opportunity', content });
          }
        } catch {
          // Save failure does not affect streaming response
        }
      },
    });

    return opportunityResult.toTextStreamResponse();
  }

  if (type === 'persona') {
    const personaBaseSystem = [
      'You are an audience insights expert. Your task is to synthesize audience demographics and genre interests into a structured persona profile.',
      'Generate a realistic, specific, and actionable persona based on the provided audience data.',
      'The persona should feel like a real person who represents this audience segment.',
    ].join(' ');

    const personaSystem = isRefinementMode
      ? `${personaBaseSystem} ${REFINEMENT_SYSTEM_SUFFIX}`
      : personaBaseSystem;

    const personaPrompt = isRefinementMode
      ? buildRefinementPrompt(audienceContext, existing_content, refinement_instruction)
      : audienceContext;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: personaSchema }),
      system: personaSystem,
      prompt: personaPrompt,
      onFinish: async ({ text }) => {
        try {
          const parsedOutput = personaSchema.safeParse(JSON.parse(text));
          if (!parsedOutput.success) return;

          const content: PersonaContent = parsedOutput.data;

          if (output_id) {
            await db.update(creativeOutputs).set({ content, updatedAt: new Date() }).where(and(eq(creativeOutputs.id, output_id), eq(creativeOutputs.userId, userId)));
          } else {
            await db.insert(creativeOutputs).values({ userId, audienceId: audience_id, type: 'persona', content });
          }
        } catch {
          // Save failure does not affect streaming response
        }
      },
    });

    return result.toTextStreamResponse();
  }

  if (type === 'messaging') {
    const messagingBaseSystem = [
      'You are an audience messaging strategist. Your task is to generate 3-5 distinct messaging angles for communicating with this audience.',
      'Each angle must be grounded in a specific audience trait or genre interest - not generic marketing advice.',
      'Make each angle feel differentiated, with a unique emotional hook and a concrete sample headline.',
    ].join(' ');

    const messagingSystem = isRefinementMode
      ? `${messagingBaseSystem} ${REFINEMENT_SYSTEM_SUFFIX}`
      : messagingBaseSystem;

    const messagingPrompt = isRefinementMode
      ? buildRefinementPrompt(audienceContext, existing_content, refinement_instruction)
      : audienceContext;

    const messagingResult = streamText({
      model: openai('gpt-4o-mini'),
      output: Output.object({ schema: messagingSchema }),
      system: messagingSystem,
      prompt: messagingPrompt,
      onFinish: async ({ text }) => {
        try {
          const parsedOutput = messagingSchema.safeParse(JSON.parse(text));
          if (!parsedOutput.success) return;

          const content: MessagingContent = parsedOutput.data;

          if (output_id) {
            await db.update(creativeOutputs).set({ content, updatedAt: new Date() }).where(and(eq(creativeOutputs.id, output_id), eq(creativeOutputs.userId, userId)));
          } else {
            await db.insert(creativeOutputs).values({ userId, audienceId: audience_id, type: 'messaging', content });
          }
        } catch {
          // Save failure does not affect streaming response
        }
      },
    });

    return messagingResult.toTextStreamResponse();
  }

  // type === 'campaign'
  const campaignBaseSystem = [
    'You are a creative campaign strategist. Your task is to generate 3-5 campaign concepts tailored to a specific audience.',
    'Each concept must clearly leverage specific genres the audience cares about and be informed by their demographic profile.',
    'Make each concept distinct, creative, and actionable. Concepts should feel differentiated from each other.',
  ].join(' ');

  const campaignSystem = isRefinementMode
    ? `${campaignBaseSystem} ${REFINEMENT_SYSTEM_SUFFIX}`
    : campaignBaseSystem;

  const campaignPrompt = isRefinementMode
    ? buildRefinementPrompt(audienceContext, existing_content, refinement_instruction)
    : audienceContext;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    output: Output.object({ schema: campaignSchema }),
    system: campaignSystem,
    prompt: campaignPrompt,
    onFinish: async ({ text }) => {
      try {
        const parsedOutput = campaignSchema.safeParse(JSON.parse(text));
        if (!parsedOutput.success) return;

        const content: CampaignContent = parsedOutput.data;

        if (output_id) {
          await db.update(creativeOutputs).set({ content, updatedAt: new Date() }).where(and(eq(creativeOutputs.id, output_id), eq(creativeOutputs.userId, userId)));
        } else {
          await db.insert(creativeOutputs).values({ userId, audienceId: audience_id, type: 'campaign', content });
        }
      } catch {
        // Save failure does not affect streaming response
      }
    },
  });

  return result.toTextStreamResponse();
}
