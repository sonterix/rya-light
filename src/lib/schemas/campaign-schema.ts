import { z } from 'zod';

const campaignConceptSchema = z.object({
  name: z.string().nullable(),
  tagline: z.string().nullable(),
  description: z.string().nullable(),
  targetGenres: z.array(z.string()),
  suggestedFormat: z.string().nullable(),
});

export const campaignSchema = z.object({
  concepts: z.array(campaignConceptSchema),
});

export type CampaignConceptSchema = z.infer<typeof campaignConceptSchema>;
export type CampaignSchema = z.infer<typeof campaignSchema>;
