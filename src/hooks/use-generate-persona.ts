'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import type { PersonaSchema } from '@/lib/schemas/persona-schema';
import { personaSchema } from '@/lib/schemas/persona-schema';

export interface UseGeneratePersonaResult {
  generate: (audienceId: string, outputId?: string) => void;
  isGenerating: boolean;
  partialPersona: Partial<PersonaSchema> | null;
  error: string | null;
}

export function useGeneratePersona(): UseGeneratePersonaResult {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [partialPersona, setPartialPersona] = useState<Partial<PersonaSchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    (audienceId: string, outputId?: string) => {
      setError(null);
      setPartialPersona(null);
      setIsGenerating(true);

      void (async () => {
        try {
          const res = await fetch('/api/creative/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audience_id: audienceId, type: 'persona', ...(outputId && { output_id: outputId }) }),
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
                setPartialPersona(parsed as Partial<PersonaSchema>);
              }
            } catch {
              // Incomplete JSON - keep accumulating
            }
          }

          if (!accumulated.trim()) {
            throw new Error('Generation returned empty response. The AI provider may be unavailable.');
          }

          const finalParsed = personaSchema.safeParse(JSON.parse(accumulated));
          if (finalParsed.success) {
            setPartialPersona(finalParsed.data);
          }

          await queryClient.invalidateQueries({ queryKey: ['creative'] });
          toast.success('Persona generated successfully');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed';
          setError(message);
          setPartialPersona(null);
        } finally {
          setIsGenerating(false);
        }
      })();
    },
    [queryClient],
  );

  return { generate, isGenerating, partialPersona, error };
}
