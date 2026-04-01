import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreativeOutput } from '@/db/schema';

export type WorkflowType = 'persona' | 'campaign' | 'messaging' | 'opportunity';

async function fetchCreativeOutputs(
  audienceId: string | null,
  type: WorkflowType | null,
): Promise<CreativeOutput[]> {
  const params = new URLSearchParams();
  if (audienceId) params.set('audience_id', audienceId);
  if (type) params.set('type', type);

  const url = `/api/creative${params.size > 0 ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch creative outputs');
  }

  const successBody = body as { data: CreativeOutput[] };
  return successBody.data;
}

async function fetchCreativeOutput(id: string): Promise<CreativeOutput> {
  const res = await fetch(`/api/creative/${id}`);
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch creative output');
  }

  const successBody = body as { data: CreativeOutput };
  return successBody.data;
}

async function patchCreativeOutput(
  id: string,
  content: Record<string, unknown>,
): Promise<CreativeOutput> {
  const res = await fetch(`/api/creative/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to update creative output');
  }

  const successBody = body as { data: CreativeOutput };
  return successBody.data;
}

async function deleteCreativeOutput(id: string): Promise<void> {
  const res = await fetch(`/api/creative/${id}`, { method: 'DELETE' });
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to delete creative output');
  }
}

export function useCreativeOutputs(
  audienceId: string | null,
  type: WorkflowType | null,
) {
  return useQuery({
    queryKey: ['creative', audienceId, type],
    queryFn: () => fetchCreativeOutputs(audienceId, type),
    enabled: audienceId !== null,
  });
}

export function useCreativeOutput(id: string | null) {
  return useQuery({
    queryKey: ['creative', 'single', id],
    queryFn: () => fetchCreativeOutput(id as string),
    enabled: id !== null,
  });
}

export function usePatchCreativeOutput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: Record<string, unknown> }) =>
      patchCreativeOutput(id, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['creative'] });
    },
  });
}

export function useDeleteCreativeOutput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCreativeOutput,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['creative'] });
    },
  });
}

async function fetchOpenAIStatus(): Promise<boolean> {
  const res = await fetch('/api/config/openai-status');
  const body: unknown = await res.json();

  if (!res.ok) {
    return false;
  }

  const successBody = body as { data: { configured: boolean } };
  return successBody.data.configured;
}

export function useOpenAIStatus() {
  return useQuery({
    queryKey: ['config', 'openai-status'],
    queryFn: fetchOpenAIStatus,
  });
}
