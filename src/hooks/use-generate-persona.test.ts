import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { toast } from 'sonner';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useGeneratePersona } from './use-generate-persona';

const mockToastSuccess = vi.mocked(toast.success);

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

const AUDIENCE_ID = '550e8400-e29b-41d4-a716-446655440000';

function makeReadableStream(chunks: string[]) {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(new TextEncoder().encode(chunks[index++]));
      } else {
        controller.close();
      }
    },
  });
}

describe('useGeneratePersona', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with idle state', () => {
    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.partialPersona).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets isGenerating to true while streaming', async () => {
    let resolveStream!: () => void;
    const streamPromise = new Promise<void>((resolve) => {
      resolveStream = resolve;
    });

    const stream = new ReadableStream({
      start(controller) {
        streamPromise.then(() => {
          controller.enqueue(new TextEncoder().encode('{}'));
          controller.close();
        });
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      body: stream,
    });

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.isGenerating).toBe(true));

    resolveStream();
    await waitFor(() => expect(result.current.isGenerating).toBe(false));
  });

  it('shows error when fetch fails with non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Audience not found' }),
    });

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.error).toBe('Audience not found'));
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.partialPersona).toBeNull();
  });

  it('shows error when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.isGenerating).toBe(false);
  });

  it('shows error when response body is null', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    });

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
  });

  it('clears error when generate is called again', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Failed' }),
    });

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: makeReadableStream([
        '{"name":"Alex","demographicSummary":"Test","topInterests":[],"lifestyleDescription":"desc","howToReachThem":"reach"}',
      ]),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('shows success toast on stream completion', async () => {
    const personaJson = JSON.stringify({
      name: 'Alex',
      demographicSummary: 'Young urban professional',
      topInterests: [{ genreName: 'Pop', interestLevel: 5 }],
      lifestyleDescription: 'Active lifestyle',
      howToReachThem: 'Social media',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      body: makeReadableStream([personaJson]),
    });

    const { result } = renderHook(() => useGeneratePersona(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.isGenerating).toBe(false));
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it('invalidates creative query cache on success', async () => {
    const personaJson = JSON.stringify({
      name: 'Alex',
      demographicSummary: 'Young urban professional',
      topInterests: [],
      lifestyleDescription: 'Active lifestyle',
      howToReachThem: 'Social media',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      body: makeReadableStream([personaJson]),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useGeneratePersona(), { wrapper });

    act(() => {
      result.current.generate(AUDIENCE_ID);
    });

    await waitFor(() => expect(result.current.isGenerating).toBe(false));
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['creative'] }),
    );
  });
});
