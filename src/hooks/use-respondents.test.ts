import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
}

const mockListResponse = {
  data: {
    respondents: [
      {
        respondentId: 1,
        audienceCategory: 'Mainstream Sports Fan',
        age: 35,
        gender: 'Male',
        region: 'West',
        state: 'CA',
        householdIncomeUsd: 118000,
      },
    ],
    pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
  },
};

const mockDetailResponse = {
  data: {
    respondent: {
      respondentId: 1,
      wave: 1,
      waveId: 101,
      weight: '1.2',
      audienceCategory: 'Mainstream Sports Fan',
      age: 35,
      gender: 'Male',
      ethnicity: 'White',
      region: 'West',
      communityType: 'Suburban',
      maritalStatus: 'Married',
      householdSize: 3,
      education: "Bachelor's Degree",
      employmentStatus: 'Employed full-time',
      householdIncomeUsd: 118000,
      investableAssetsUsd: 50000,
      zipCode: '90210',
      state: 'CA',
      dma: 'Los Angeles',
      parentStatus: 'Not a parent',
      politicalAffiliation: 'Independent',
      homeOwnership: 'Own',
    },
    genreInterests: [{ genreSlug: 'action', genreName: 'Action', interestLevel: 5 }],
  },
};

describe('useRespondents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches respondents for page 1 by default', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockListResponse),
    });

    const { useRespondents } = await import('./use-respondents');
    const { result } = renderHook(() => useRespondents(1), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/respondents?page=1');
    expect(result.current.data?.data.respondents).toHaveLength(1);
  });

  it('fetches respondents for the given page', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockListResponse),
    });

    const { useRespondents } = await import('./use-respondents');
    const { result } = renderHook(() => useRespondents(3), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/respondents?page=3');
  });

  it('returns error state on fetch failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { useRespondents } = await import('./use-respondents');
    const { result } = renderHook(() => useRespondents(1), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useRespondentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches respondent detail for given id', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDetailResponse),
    });

    const { useRespondentDetail } = await import('./use-respondents');
    const { result } = renderHook(() => useRespondentDetail(1), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/respondents/1');
    expect(result.current.data?.data.respondent.respondentId).toBe(1);
    expect(result.current.data?.data.genreInterests).toHaveLength(1);
  });

  it('does not fetch when id is null', async () => {
    const { useRespondentDetail } = await import('./use-respondents');
    const { result } = renderHook(() => useRespondentDetail(null), {
      wrapper: makeWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
