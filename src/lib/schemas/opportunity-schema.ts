import { z } from 'zod';

const opportunityItemSchema = z.object({
  gapGenre: z.string().nullable(),
  audienceTrait: z.string().nullable(),
  crossoverConcept: z.string().nullable(),
  reasoning: z.string().nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const opportunitySchema = z.object({
  opportunities: z.array(opportunityItemSchema),
});

export type OpportunityItemSchema = z.infer<typeof opportunityItemSchema>;
export type OpportunitySchema = z.infer<typeof opportunitySchema>;
