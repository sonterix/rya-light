'use client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({ invalidateQueries: mockInvalidateQueries })),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import type { CreativeContent } from '@/types/creative';

import { useRefineCreative } from './use-refine-creative';

const TEST_OUTPUT_ID = 'out-1';

const TEST_PERSONA_CONTENT: CreativeContent = {
  name: 'Alex',
  demographicSummary: 'Ages 25-34',
  topInterests: [],
  lifestyleDescription: 'Active lifestyle',
  howToReachThem: 'Social media',
};

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
    const refined = JSON.stringify({
      name: 'Refined Alex',
      demographicSummary: 'Ages 25-34',
      topInterests: [],
      lifestyleDescription: 'Active lifestyle',
      howToReachThem: 'Social media',
    });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode(refined));
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
        TEST_PERSONA_CONTENT,
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

    const callArgs = mockFetch.mock.calls[0] as [string, { body: string }];
    const callBody: unknown = JSON.parse(callArgs[1].body);
    expect(callBody).toEqual(expect.objectContaining({
      audience_id: 'aud-1',
      type: 'persona',
      existing_content: TEST_PERSONA_CONTENT,
      refinement_instruction: 'Make it shorter',
    }));
  });

  it('sets isRefining false after stream completes', async () => {
    const mockEncoder = new TextEncoder();
    const refined = JSON.stringify({
      name: 'Done',
      demographicSummary: 'Ages 25-34',
      topInterests: [],
      lifestyleDescription: 'Active lifestyle',
      howToReachThem: 'Social media',
    });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode(refined));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({ ok: true, body: stream });

    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine(TEST_PERSONA_CONTENT, 'Make shorter', 'aud-1');
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
      await result.current.refine(TEST_PERSONA_CONTENT, 'Make shorter', 'aud-1');
    });

    await waitFor(() => expect(result.current.error).toBe('Unauthorized'));
  });

  it('calls onComplete with parsed content when stream finishes', async () => {
    const mockEncoder = new TextEncoder();
    const refinedContent = {
      name: 'Refined',
      demographicSummary: 'Ages 18-25',
      topInterests: [],
      lifestyleDescription: 'Casual lifestyle',
      howToReachThem: 'Email',
    };
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockEncoder.encode(JSON.stringify(refinedContent)));
        controller.close();
      },
    });

    mockFetch.mockResolvedValue({ ok: true, body: stream });

    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useRefineCreative(TEST_OUTPUT_ID, 'persona'),
    );

    await act(async () => {
      await result.current.refine(TEST_PERSONA_CONTENT, 'Make shorter', 'aud-1', onComplete);
    });

    expect(onComplete).toHaveBeenCalledWith(refinedContent);
  });
});
