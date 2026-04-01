'use client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({ invalidateQueries: mockInvalidateQueries })),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import { useRefineCreative } from './use-refine-creative';

const TEST_OUTPUT_ID = 'out-1';

describe('useRefineCreative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial idle state', () => {
    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    expect(result.current.isRefining).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls generate endpoint with refinement params', async () => {
    const mockEncoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode('{"name":"Refined Alex"}'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      body: stream,
    });

    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine(
        { name: 'Alex' },
        'Make it shorter',
        'aud-1',
        onComplete,
      );
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/creative/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const callBody = JSON.parse(
      (mockFetch.mock.calls[0] as Array<{ body: string }>)[1].body as string,
    );
    expect(callBody.audience_id).toBe('aud-1');
    expect(callBody.type).toBe('persona');
    expect(callBody.existing_content).toEqual({ name: 'Alex' });
    expect(callBody.refinement_instruction).toBe('Make it shorter');
  });

  it('sets isRefining false after stream completes', async () => {
    const mockEncoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode('{"name":"Done"}'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({ ok: true, body: stream });

    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine({ name: 'Alex' }, 'Make shorter', 'aud-1');
    });

    expect(result.current.isRefining).toBe(false);
  });

  it('sets error when fetch fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine({ name: 'Alex' }, 'Make shorter', 'aud-1');
    });

    await waitFor(() => expect(result.current.error).toBe('Unauthorized'));
  });

  it('calls onComplete with parsed content when stream finishes', async () => {
    const mockEncoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode('{"name":"Refined"}'));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({ ok: true, body: stream });

    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine({ name: 'Alex' }, 'Make shorter', 'aud-1', onComplete);
    });

    expect(onComplete).toHaveBeenCalledWith({ name: 'Refined' });
  });
});
