'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { CampaignSchema } from '@/lib/schemas/campaign-schema';
import { campaignSchema } from '@/lib/schemas/campaign-schema';

export interface UseGenerateCampaignResult {
  generate: (audienceId: string) => void;
  isGenerating: boolean;
  partialCampaign: Partial<CampaignSchema> | null;
  error: string | null;
}

export function useGenerateCampaign(): UseGenerateCampaignResult {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialCampaign, setPartialCampaign] = useState<Partial<CampaignSchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    (audienceId: string) => {
      setError(null);
      setPartialCampaign(null);
      setIsGenerating(true);

      void (async () => {
        try {
          const res = await fetch('/api/creative/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audience_id: audienceId, type: 'campaign' }),
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
                setPartialCampaign(parsed as Partial<CampaignSchema>);
              }
            } catch {
              // Incomplete JSON - keep accumulating
            }
          }

          if (!accumulated.trim()) {
            throw new Error('Generation returned empty response. The AI provider may be unavailable.');
          }

          const finalParsed = campaignSchema.safeParse(JSON.parse(accumulated));
          if (finalParsed.success) {
            setPartialCampaign(finalParsed.data);
          }

          await queryClient.invalidateQueries({ queryKey: ['creative'] });
          toast.success('Campaign concepts generated successfully');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed';
          setError(message);
          setPartialCampaign(null);
        } finally {
          setIsGenerating(false);
        }
      })();
    },
    [queryClient],
  );

  return { generate, isGenerating, partialCampaign, error };
}
