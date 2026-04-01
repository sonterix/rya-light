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

function countField(respondentData: Respondent[], accessor: (r: Respondent) => string): string {
  const counts = new Map<string, number>();
  for (const r of respondentData) {
    const val = accessor(r);
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  const total = respondentData.length;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => `${label}: ${Math.round((n / total) * 100)}%`)
    .join(', ');
}

function buildDemographicsSummary(respondentData: Respondent[]): string {
  if (respondentData.length === 0) {
    return 'No demographic data available.';
  }

  const count = respondentData.length;
  const avgAge = Math.round(respondentData.reduce((sum, r) => sum + r.age, 0) / count);
  const avgIncome = Math.round(respondentData.reduce((sum, r) => sum + r.householdIncomeUsd, 0) / count);

  return [
    `${count} respondents.`,
    `Average age: ${avgAge}.`,
    `Gender: ${countField(respondentData, (r) => r.gender)}.`,
    `Regions: ${countField(respondentData, (r) => r.region)}.`,
    `Community: ${countField(respondentData, (r) => r.communityType)}.`,
    `Education: ${countField(respondentData, (r) => r.education)}.`,
    `Employment: ${countField(respondentData, (r) => r.employmentStatus)}.`,
    `Parent status: ${countField(respondentData, (r) => r.parentStatus)}.`,
    `Average household income: $${avgIncome.toLocaleString()}.`,
  ].join(' ');
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
    `Top genre interests (scale: 1=highest interest, 5=unfamiliar; lower score = stronger interest):`,
    ...topGenres.map(
      (g) =>
        `- ${g.genreName}: avg score ${parseFloat(g.avgInterest).toFixed(2)}, ` +
        `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% rated it highly interested (1 or 2)`,
    ),
  ].join('\n');

  const userId = auth.user.id;

  if (type === 'opportunity') {
    const highInterestGenres = genreSummaryRows.filter(
      (g) => parseFloat(g.avgInterest) <= 2.5,
    );
    const gapGenres = genreSummaryRows.filter(
      (g) => parseFloat(g.avgInterest) > 2.5,
    );

    const opportunityContext = [
      `Audience name: ${audience.name}`,
      `Demographics: ${demographicsSummary}`,
      `Scale: 1=highest interest, 5=unfamiliar. Lower score = stronger interest.`,
      ``,
      `Strong-interest genres (avg score <= 2.5, audience already engaged):`,
      ...highInterestGenres.map(
        (g) =>
          `- ${g.genreName}: avg score ${parseFloat(g.avgInterest).toFixed(2)}, ` +
          `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% highly interested`,
      ),
      ``,
      `Low/neutral-interest genres (avg score > 2.5, these are the WHITE SPACE gap opportunities):`,
      ...gapGenres.map(
        (g) =>
          `- ${g.genreName}: avg score ${parseFloat(g.avgInterest).toFixed(2)}, ` +
          `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}% highly interested`,
      ),
    ].join('\n');

    const opportunityBaseSystem = [
      'You are an audience insights strategist specializing in white space analysis.',
      'Your task is to find non-obvious content opportunities by combining audience demographic traits with genres they currently show LOW or NEUTRAL interest in (high average score = low interest).',
      'The interest scale is 1=highest interest, 5=unfamiliar. Genres with avg score > 2.5 are the gap/white space opportunities.',
      'For each opportunity, provide: gapGenre (the underused genre), audienceTrait (the specific demographic trait that creates the opportunity),',
      'crossoverConcept (a creative concept that bridges the gap genre with the audience\'s existing interests or traits),',
      'reasoning (why this connection is plausible despite low current interest),',
      'and confidence ("high", "medium", or "low" based on how strong the demographic-genre bridge is).',
      'Focus on surprising but plausible bridges that competitors are likely missing.',
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
      'You are an audience insights expert working for a marketing strategist.',
      'Synthesize the provided audience demographics and genre interests into a one-page persona snapshot.',
      'The persona should feel like a real person who represents this audience segment.',
      'Your output must include: a persona name, a demographicSummary (2-3 sentences summarizing age, gender, region, income, lifestyle),',
      'topInterests (array of objects with genreName and interestLevel score from the audience data),',
      'a lifestyleDescription (paragraph about daily life, habits, media consumption, values),',
      'and howToReachThem (specific channels, platforms, content formats, and timing to reach this persona).',
      'Ground every detail in the actual audience data provided. Do not invent demographics that contradict the data.',
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
      'You are a messaging strategist for a marketing team.',
      'Generate 3-5 distinct messaging angles based on the audience\'s top genres and demographics.',
      'Each angle must include: a name (angle label), tone (1-2 word tone descriptor like "Warm, grounded" or "Aspirational, bold"),',
      'sampleHeadline (a concrete headline a copywriter could use), emotionalHook (the emotional lever this angle pulls),',
      'and keyTrait (the specific audience genre interest or demographic trait this angle leverages, e.g., "Meditation interest + parent status").',
      'Each angle must be grounded in a specific data point from the audience - not generic marketing advice.',
      'Make each angle feel differentiated from the others in tone and approach.',
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
    'You are a creative campaign strategist for a marketing team.',
    'Generate 3-5 campaign concepts tailored to the provided audience data.',
    'Each concept must include: a name (campaign title), tagline (short punchy line),',
    'description (2-3 sentences explaining the concept and how it connects to the audience),',
    'targetGenres (array of genre names from the audience data that this campaign leverages),',
    'and suggestedFormat (e.g., "Connected TV series", "Instagram Reels", "Podcast sponsorship", "Email campaign").',
    'Each concept must clearly leverage specific genres the audience cares about and be informed by their demographics.',
    'Make each concept distinct and actionable. A marketer should be able to take these to a creative brief.',
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
