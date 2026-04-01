import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Audience, Respondent } from '@/db/schema';
import type { AudienceFilters } from '@/lib/filter-matching';

async function fetchAllRespondentsForPreview(): Promise<Respondent[]> {
  const res = await fetch('/api/respondents/preview');
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch respondents');
  }

  const successBody = body as { data: Respondent[] };
  return successBody.data;
}

export function useRespondentsForPreview() {
  return useQuery({
    queryKey: ['respondents', 'preview'],
    queryFn: fetchAllRespondentsForPreview,
  });
}

interface AudienceWithRespondents {
  audience: Audience;
  respondents: Respondent[];
}

interface CreateAudienceInput {
  name: string;
  filters: AudienceFilters | null;
  manualIncludes: number[];
  manualExcludes: number[];
}

async function fetchAudiences(): Promise<Audience[]> {
  const res = await fetch('/api/audiences');
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch audiences');
  }

  const successBody = body as { data: Audience[] };
  return successBody.data;
}

async function fetchAudienceWithRespondents(id: string): Promise<AudienceWithRespondents> {
  const res = await fetch(`/api/audiences/${id}`);
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch audience');
  }

  const successBody = body as { data: AudienceWithRespondents };
  return successBody.data;
}

async function createAudience(input: CreateAudienceInput): Promise<Audience> {
  const res = await fetch('/api/audiences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to create audience');
  }

  const successBody = body as { data: Audience };
  return successBody.data;
}

export function useAudiences() {
  return useQuery({
    queryKey: ['audiences'],
    queryFn: fetchAudiences,
  });
}

export function useAudienceWithRespondents(id: string | null) {
  return useQuery({
    queryKey: ['audiences', id],
    queryFn: () => {
      if (!id) throw new Error('Audience ID is required');
      return fetchAudienceWithRespondents(id);
    },
    enabled: id !== null,
  });
}

export function useCreateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAudience,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['audiences'] });
    },
  });
}
