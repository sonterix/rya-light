'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { MessagingSchema } from '@/lib/schemas/messaging-schema';
import { messagingSchema } from '@/lib/schemas/messaging-schema';

export interface UseGenerateMessagingResult {
  generate: (audienceId: string) => void;
  isGenerating: boolean;
  partialMessaging: Partial<MessagingSchema> | null;
  error: string | null;
}

export function useGenerateMessaging(): UseGenerateMessagingResult {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialMessaging, setPartialMessaging] = useState<Partial<MessagingSchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    (audienceId: string) => {
      setError(null);
      setPartialMessaging(null);
      setIsGenerating(true);

      void (async () => {
        try {
          const res = await fetch('/api/creative/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audience_id: audienceId, type: 'messaging' }),
          });

          if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            throw new Error(body.error ?? 'Generation failed');
          }

          if (!res.body) {
            throw new Error('No response body');
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            accumulated += decoder.decode(value, { stream: true });

            // Try to parse accumulated JSON as partial object
            try {
              const parsed: unknown = JSON.parse(accumulated);
              if (typeof parsed === 'object' && parsed !== null) {
                setPartialMessaging(parsed as Partial<MessagingSchema>);
              }
            } catch {
              // Incomplete JSON - keep accumulating
            }
          }

          // Final parse - validate against full schema
          const finalParsed = messagingSchema.safeParse(JSON.parse(accumulated));
          if (finalParsed.success) {
            setPartialMessaging(finalParsed.data);
          }

          await queryClient.invalidateQueries({ queryKey: ['creative'] });
          toast.success('Messaging angles generated successfully');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed';
          setError(message);
          setPartialMessaging(null);
        } finally {
          setIsGenerating(false);
        }
      })();
    },
    [queryClient],
  );

  return { generate, isGenerating, partialMessaging, error };
}
