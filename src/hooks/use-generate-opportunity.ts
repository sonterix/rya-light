'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { OpportunitySchema } from '@/lib/schemas/opportunity-schema';
import { opportunitySchema } from '@/lib/schemas/opportunity-schema';

export interface UseGenerateOpportunityResult {
  generate: (audienceId: string, outputId?: string) => void;
  isGenerating: boolean;
  partialOpportunity: Partial<OpportunitySchema> | null;
  error: string | null;
}

export function useGenerateOpportunity(): UseGenerateOpportunityResult {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialOpportunity, setPartialOpportunity] = useState<Partial<OpportunitySchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    (audienceId: string, outputId?: string) => {
      setError(null);
      setPartialOpportunity(null);
      setIsGenerating(true);

      void (async () => {
        try {
          const res = await fetch('/api/creative/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audience_id: audienceId, type: 'opportunity', ...(outputId && { output_id: outputId }) }),
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
                setPartialOpportunity(parsed as Partial<OpportunitySchema>);
              }
            } catch {
              // Incomplete JSON - keep accumulating
            }
          }

          if (!accumulated.trim()) {
            throw new Error('Generation returned empty response. The AI provider may be unavailable.');
          }

          const finalParsed = opportunitySchema.safeParse(JSON.parse(accumulated));
          if (finalParsed.success) {
            setPartialOpportunity(finalParsed.data);
          }

          await queryClient.invalidateQueries({ queryKey: ['creative'] });
          toast.success('Content opportunities generated successfully');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed';
          setError(message);
          setPartialOpportunity(null);
        } finally {
          setIsGenerating(false);
        }
      })();
    },
    [queryClient],
  );

  return { generate, isGenerating, partialOpportunity, error };
}
