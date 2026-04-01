import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockClearSelectedAudienceId = vi.fn();
let mockSelectedAudienceId: string | null = null;

vi.mock('@/stores/audience-store', () => ({
  useAudienceStore: (selector: (state: { selectedAudienceId: string | null; clearSelectedAudienceId: () => void }) => unknown) =>
    selector({ selectedAudienceId: mockSelectedAudienceId, clearSelectedAudienceId: mockClearSelectedAudienceId }),
}));

import { useAudiences, useCreateAudience, useAudienceWithRespondents, useUpdateAudience, useDeleteAudience, useAudienceInsights } from './use-audiences';

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
    expect(result.current.data?.[0].id).toBe('aud-1');
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

describe('useUpdateAudience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends PATCH request and returns updated audience', async () => {
    const updatedAudience = { ...TEST_AUDIENCE, name: 'Updated Name' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: updatedAudience }),
    });

    const { result } = renderHook(() => useUpdateAudience(), { wrapper: createWrapper() });

    result.current.mutate({ id: 'aud-1', name: 'Updated Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/audiences/aud-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result.current.data?.name).toBe('Updated Name');
  });

  it('handles update error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    });

    const { result } = renderHook(() => useUpdateAudience(), { wrapper: createWrapper() });

    result.current.mutate({ id: 'aud-1', name: 'New Name' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDeleteAudience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedAudienceId = null;
    mockClearSelectedAudienceId.mockReset();
  });

  it('sends DELETE request on mutate', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { success: true } }),
    });

    const { result } = renderHook(() => useDeleteAudience(), { wrapper: createWrapper() });

    result.current.mutate('aud-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/audiences/aud-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('clears selected audience when deleting the selected one', async () => {
    mockSelectedAudienceId = 'aud-1';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { success: true } }),
    });

    const { result } = renderHook(() => useDeleteAudience(), { wrapper: createWrapper() });

    result.current.mutate('aud-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockClearSelectedAudienceId).toHaveBeenCalled();
  });

  it('does not clear selection when deleting a non-selected audience', async () => {
    mockSelectedAudienceId = 'aud-2';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { success: true } }),
    });

    const { result } = renderHook(() => useDeleteAudience(), { wrapper: createWrapper() });

    result.current.mutate('aud-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockClearSelectedAudienceId).not.toHaveBeenCalled();
  });

  it('handles delete error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    });

    const { result } = renderHook(() => useDeleteAudience(), { wrapper: createWrapper() });

    result.current.mutate('aud-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

const TEST_GENRE_SUMMARIES = [
  {
    genreSlug: 'RQ.2.34',
    genreName: 'Cooking / Baking',
    avgInterest: '1.3',
    pctHighlyInterested: '1.0',
    respondentCount: 3,
  },
];

describe('useAudienceInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches genre summaries from the insights API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: TEST_GENRE_SUMMARIES }),
    });

    const { result } = renderHook(() => useAudienceInsights('aud-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].genreSlug).toBe('RQ.2.34');
    expect(mockFetch).toHaveBeenCalledWith('/api/audiences/aud-1/insights');
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useAudienceInsights(null), { wrapper: createWrapper() });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('handles API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useAudienceInsights('aud-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
