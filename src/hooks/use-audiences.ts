import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Audience, Respondent } from '@/db/schema';
import type { AudienceFilters } from '@/lib/filter-matching';
import { useAudienceStore } from '@/stores/audience-store';

export interface GenreInsight {
  genreSlug: string;
  genreName: string;
  avgInterest: string;
  pctHighlyInterested: string;
  respondentCount: number;
}

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

interface UpdateAudienceInput {
  id: string;
  name?: string;
  filters?: AudienceFilters | null;
  manualIncludes?: number[] | null;
  manualExcludes?: number[] | null;
}

async function fetchAudienceInsights(id: string): Promise<GenreInsight[]> {
  const res = await fetch(`/api/audiences/${id}/insights`);
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to fetch audience insights');
  }

  const successBody = body as { data: GenreInsight[] };
  return successBody.data;
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

async function updateAudience({ id, ...patch }: UpdateAudienceInput): Promise<Audience> {
  const res = await fetch(`/api/audiences/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to update audience');
  }

  const successBody = body as { data: Audience };
  return successBody.data;
}

async function deleteAudience(id: string): Promise<void> {
  const res = await fetch(`/api/audiences/${id}`, {
    method: 'DELETE',
  });
  const body: unknown = await res.json();

  if (!res.ok) {
    const errorBody = body as { error?: string };
    throw new Error(errorBody.error ?? 'Failed to delete audience');
  }
}

export function useAudienceInsights(id: string | null) {
  return useQuery({
    queryKey: ['audiences', id, 'insights'],
    queryFn: () => {
      if (!id) throw new Error('Audience ID is required');
      return fetchAudienceInsights(id);
    },
    enabled: id !== null,
  });
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

export function useUpdateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAudience,
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ['audiences'] });
      void queryClient.invalidateQueries({ queryKey: ['audiences', updated.id] });
    },
  });
}

export function useDeleteAudience() {
  const queryClient = useQueryClient();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const clearSelectedAudienceId = useAudienceStore((state) => state.clearSelectedAudienceId);

  return useMutation({
    mutationFn: deleteAudience,
    onSuccess: (_, deletedId) => {
      if (selectedAudienceId === deletedId) {
        clearSelectedAudienceId();
      }
      void queryClient.invalidateQueries({ queryKey: ['audiences'] });
    },
  });
}
