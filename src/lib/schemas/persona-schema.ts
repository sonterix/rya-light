import { z } from 'zod';

export const personaSchema = z.object({
  name: z.string(),
  demographicSummary: z.string(),
  topInterests: z.array(
    z.object({
      genreName: z.string(),
      interestLevel: z.number(),
    }),
  ),
  lifestyleDescription: z.string(),
  howToReachThem: z.string(),
});

export type PersonaSchema = z.infer<typeof personaSchema>;
