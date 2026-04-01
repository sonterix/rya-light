import { useQuery } from '@tanstack/react-query';

import type { RespondentDetailResponse, RespondentListResponse } from '@/types/respondent';

async function fetchRespondents(page: number): Promise<RespondentListResponse> {
  const response = await fetch(`/api/respondents?page=${page}`);
  if (!response.ok) {
    const body = await response.json();
    throw new Error(typeof body.error === 'string' ? body.error : 'Failed to fetch respondents');
  }
  return response.json();
}

async function fetchRespondentDetail(id: number): Promise<RespondentDetailResponse> {
  const response = await fetch(`/api/respondents/${id}`);
  if (!response.ok) {
    const body = await response.json();
    throw new Error(
      typeof body.error === 'string' ? body.error : 'Failed to fetch respondent detail',
    );
  }
  return response.json();
}

export function useRespondents(page: number) {
  return useQuery({
    queryKey: ['respondents', page],
    queryFn: () => fetchRespondents(page),
  });
}

export function useRespondentDetail(id: number | null) {
  return useQuery({
    queryKey: ['respondent', id],
    queryFn: () => fetchRespondentDetail(id as number),
    enabled: id !== null,
  });
}
