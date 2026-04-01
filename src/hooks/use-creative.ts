import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreativeOutput } from '@/db/schema';
import type { CreativeContent, WorkflowType } from '@/types/creative';

export type { WorkflowType };

function hasError(body: unknown): body is { error: string } {
  if (body === null || typeof body !== 'object' || !('error' in body)) return false;
  return typeof body.error === 'string';
}

function hasData<T>(body: unknown): body is { data: T } {
  return body !== null && typeof body === 'object' && 'data' in body;
}

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
    if (hasError(body)) throw new Error(body.error);
    throw new Error('Failed to fetch creative outputs');
  }

  if (!hasData<CreativeOutput[]>(body)) throw new Error('Unexpected response');
  return body.data;
}

async function fetchCreativeOutput(id: string): Promise<CreativeOutput> {
  const res = await fetch(`/api/creative/${id}`);
  const body: unknown = await res.json();

  if (!res.ok) {
    if (hasError(body)) throw new Error(body.error);
    throw new Error('Failed to fetch creative output');
  }

  if (!hasData<CreativeOutput>(body)) throw new Error('Unexpected response');
  return body.data;
}

async function patchCreativeOutput(
  id: string,
  content: CreativeContent,
): Promise<CreativeOutput> {
  const res = await fetch(`/api/creative/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const body: unknown = await res.json();

  if (!res.ok) {
    if (hasError(body)) throw new Error(body.error);
    throw new Error('Failed to update creative output');
  }

  if (!hasData<CreativeOutput>(body)) throw new Error('Unexpected response');
  return body.data;
}

async function deleteCreativeOutput(id: string): Promise<void> {
  const res = await fetch(`/api/creative/${id}`, { method: 'DELETE' });
  const body: unknown = await res.json();

  if (!res.ok) {
    if (hasError(body)) throw new Error(body.error);
    throw new Error('Failed to delete creative output');
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
    queryFn: () => {
      if (!id) throw new Error('No output ID');
      return fetchCreativeOutput(id);
    },
    enabled: id !== null,
  });
}

export function usePatchCreativeOutput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: CreativeContent }) =>
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

  if (!hasData<{ configured: boolean }>(body)) return false;
  return body.data.configured;
}

export function useOpenAIStatus() {
  return useQuery({
    queryKey: ['config', 'openai-status'],
    queryFn: fetchOpenAIStatus,
  });
}
