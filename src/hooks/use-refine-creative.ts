'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { WorkflowType } from './use-creative';

export interface UseRefineCreativeResult {
  refine: (
    existingContent: Record<string, unknown>,
    refinementInstruction: string,
    audienceId: string,
    onComplete?: (content: Record<string, unknown>) => void,
  ) => Promise<void>;
  isRefining: boolean;
  partialContent: Record<string, unknown> | null;
  error: string | null;
}

export function useRefineCreative(
  outputId: string,
  type: WorkflowType,
): UseRefineCreativeResult {
  const queryClient = useQueryClient();
  const [isRefining, setIsRefining] = useState(false);
  const [partialContent, setPartialContent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refine = useCallback(
    async (
      existingContent: Record<string, unknown>,
      refinementInstruction: string,
      audienceId: string,
      onComplete?: (content: Record<string, unknown>) => void,
    ) => {
      setError(null);
      setPartialContent(null);
      setIsRefining(true);

      try {
        const res = await fetch('/api/creative/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audience_id: audienceId,
            type,
            output_id: outputId,
            existing_content: existingContent,
            refinement_instruction: refinementInstruction,
          }),
        });

        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? 'Refinement failed');
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

          try {
            const parsed: unknown = JSON.parse(accumulated);
            if (typeof parsed === 'object' && parsed !== null) {
              setPartialContent(parsed as Record<string, unknown>);
            }
          } catch {
            // Incomplete JSON - keep accumulating
          }
        }

        if (!accumulated.trim()) {
          throw new Error('Refinement returned empty response. The AI provider may be unavailable.');
        }

        const finalParsed = JSON.parse(accumulated) as Record<string, unknown>;
        setPartialContent(finalParsed);
        onComplete?.(finalParsed);

        void queryClient.invalidateQueries({ queryKey: ['creative'] });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Refinement failed';
        setError(message);
        setPartialContent(null);
      } finally {
        setIsRefining(false);
      }
    },
    [outputId, type, queryClient],
  );

  return { refine, isRefining, partialContent, error };
}
