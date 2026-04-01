import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { useAudiences, useCreateAudience, useAudienceWithRespondents } from './use-audiences';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const TEST_AUDIENCE = {
  id: 'aud-1',
  userId: 'user-123',
  name: 'My Audience',
  filters: { gender: ['Female'] },
  manualIncludes: [],
  manualExcludes: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useAudiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches audiences from API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [TEST_AUDIENCE] }),
    });

    const { result } = renderHook(() => useAudiences(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe('aud-1');
    expect(mockFetch).toHaveBeenCalledWith('/api/audiences');
  });

  it('returns empty array when API returns empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    const { result } = renderHook(() => useAudiences(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('handles API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useAudiences(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useAudienceWithRespondents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches audience with respondents from API', async () => {
    const respondent = { respondentId: 1, name: 'John' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { audience: TEST_AUDIENCE, respondents: [respondent] } }),
    });

    const { result } = renderHook(() => useAudienceWithRespondents('aud-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.audience.id).toBe('aud-1');
    expect(result.current.data?.respondents).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/audiences/aud-1');
  });

  it('does not fetch when id is null', async () => {
    const { result } = renderHook(() => useAudienceWithRespondents(null), { wrapper: createWrapper() });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateAudience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts to API and returns created audience', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: TEST_AUDIENCE }),
    });

    const { result } = renderHook(() => useCreateAudience(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'My Audience', filters: null, manualIncludes: [], manualExcludes: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/audiences', expect.objectContaining({ method: 'POST' }));
    expect(result.current.data?.id).toBe('aud-1');
  });

  it('handles creation error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Name is required' }),
    });

    const { result } = renderHook(() => useCreateAudience(), { wrapper: createWrapper() });

    result.current.mutate({ name: '', filters: null, manualIncludes: [], manualExcludes: [] });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
