'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type { CreativeContent } from '@/types/creative';
import {
  isCampaignContent,
  isMessagingContent,
  isOpportunityContent,
  isPersonaContent,
} from '@/types/creative';

import type { WorkflowType } from './use-creative';

function hasError(body: unknown): body is { error: string } {
  if (body === null || typeof body !== 'object' || !('error' in body)) return false;
  return typeof body.error === 'string';
}

function isCreativeContent(value: unknown): value is CreativeContent {
  return isPersonaContent(value) || isCampaignContent(value) || isMessagingContent(value) || isOpportunityContent(value);
}

export interface UseRefineCreativeResult {
  refine: (
    existingContent: CreativeContent,
    refinementInstruction: string,
    audienceId: string,
    onComplete?: (content: CreativeContent) => void,
  ) => Promise<void>;
  isRefining: boolean;
  partialContent: CreativeContent | null;
  error: string | null;
}

export function useRefineCreative(
  outputId: string,
  type: WorkflowType,
): UseRefineCreativeResult {
  const queryClient = useQueryClient();
  const [isRefining, setIsRefining] = useState(false);
  const [partialContent, setPartialContent] = useState<CreativeContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refine = useCallback(
    async (
      existingContent: CreativeContent,
      refinementInstruction: string,
      audienceId: string,
      onComplete?: (content: CreativeContent) => void,
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
          const body: unknown = await res.json();
          if (hasError(body)) throw new Error(body.error);
          throw new Error('Refinement failed');
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
            if (isCreativeContent(parsed)) {
              setPartialContent(parsed);
            }
          } catch {
            // Incomplete JSON - keep accumulating
          }
        }

        if (!accumulated.trim()) {
          throw new Error('Refinement returned empty response. The AI provider may be unavailable.');
        }

        const finalParsed: unknown = JSON.parse(accumulated);
        if (isCreativeContent(finalParsed)) {
          setPartialContent(finalParsed);
          onComplete?.(finalParsed);
        }

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
