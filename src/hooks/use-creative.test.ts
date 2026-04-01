import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { useCreativeOutput, useCreativeOutputs, useDeleteCreativeOutput, useOpenAIStatus, usePatchCreativeOutput } from './use-creative';

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

const TEST_OUTPUT = {
  id: 'out-1',
  userId: 'user-123',
  audienceId: 'aud-1',
  type: 'persona',
  content: { name: 'Alex', tagline: 'The Explorer' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useCreativeOutputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches creative outputs with audienceId and type', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [TEST_OUTPUT] }),
    });

    const { result } = renderHook(
      () => useCreativeOutputs('aud-1', 'persona'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe('out-1');
    expect(mockFetch).toHaveBeenCalledWith('/api/creative?audience_id=aud-1&type=persona');
  });

  it('fetches with only audienceId when type is null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [TEST_OUTPUT] }),
    });

    const { result } = renderHook(
      () => useCreativeOutputs('aud-1', null),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/creative?audience_id=aud-1');
  });

  it('does not fetch when audienceId is null', async () => {
    const { result } = renderHook(
      () => useCreativeOutputs(null, null),
      { wrapper: createWrapper() },
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('handles API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(
      () => useCreativeOutputs('aud-1', 'campaign'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDeleteCreativeOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DELETE endpoint and invalidates queries', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { success: true } }),
    });

    const { result } = renderHook(() => useDeleteCreativeOutput(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('out-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/creative/out-1', { method: 'DELETE' });
  });

  it('handles deletion error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    const { result } = renderHook(() => useDeleteCreativeOutput(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('out-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreativeOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single creative output by id', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: TEST_OUTPUT }),
    });

    const { result } = renderHook(
      () => useCreativeOutput('out-1'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('out-1');
    expect(mockFetch).toHaveBeenCalledWith('/api/creative/out-1');
  });

  it('does not fetch when id is null', async () => {
    const { result } = renderHook(
      () => useCreativeOutput(null),
      { wrapper: createWrapper() },
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

describe('usePatchCreativeOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PATCH endpoint with id and content', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { ...TEST_OUTPUT, content: { name: 'Updated' } } }),
    });

    const { result } = renderHook(() => usePatchCreativeOutput(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'out-1', content: { name: 'Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/creative/out-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { name: 'Updated' } }),
    });
  });

  it('handles patch error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    const { result } = renderHook(() => usePatchCreativeOutput(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: 'out-1', content: { name: 'Updated' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useOpenAIStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when OPENAI key is configured', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { configured: true } }),
    });

    const { result } = renderHook(() => useOpenAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/config/openai-status');
  });

  it('returns false when OPENAI key is not configured', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { configured: false } }),
    });

    const { result } = renderHook(() => useOpenAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(false);
  });

  it('returns false on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useOpenAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(false);
  });
});
