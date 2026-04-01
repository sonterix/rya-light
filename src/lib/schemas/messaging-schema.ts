import { z } from 'zod';

const messagingAngleSchema = z.object({
  name: z.string().nullable(),
  tone: z.string().nullable(),
  sampleHeadline: z.string().nullable(),
  emotionalHook: z.string().nullable(),
  keyTrait: z.string().nullable(),
});

export const messagingSchema = z.object({
  angles: z.array(messagingAngleSchema),
});

export type MessagingAngleSchema = z.infer<typeof messagingAngleSchema>;
export type MessagingSchema = z.infer<typeof messagingSchema>;
