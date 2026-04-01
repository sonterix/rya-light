vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  audiences: { id: 'id', userId: 'userId' },
  audienceGenreSummaries: { audienceId: 'audienceId', genreSlug: 'genreSlug' },
  genres: { genreSlug: 'genreSlug', genreName: 'genreName' },
  respondents: { respondentId: 'respondentId' },
  creativeOutputs: { id: 'id', userId: 'userId', audienceId: 'audienceId' },
}));

vi.mock('@/lib/filter-matching', () => ({
  applyFilters: vi.fn(() => []),
}));

vi.mock('ai', () => ({
  streamText: vi.fn(),
  Output: {
    object: vi.fn(() => ({ name: 'object' })),
  },
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({})),
}));

import { streamText } from 'ai';
import { NextRequest } from 'next/server';

import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { POST } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);
const mockStreamText = vi.mocked(streamText);

const TEST_USER_ID = 'user-123';
const TEST_AUDIENCE_ID = '550e8400-e29b-41d4-a716-446655440000';

const TEST_AUDIENCE = {
  id: TEST_AUDIENCE_ID,
  userId: TEST_USER_ID,
  name: 'Test Audience',
  filters: null,
  manualIncludes: null,
  manualExcludes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function mockAuth(userId = TEST_USER_ID) {
  mockGetAuthUser.mockResolvedValue({
    user: {
      id: userId,
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '',
    },
  });
}

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/creative/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockStreamResponse(streamResponse: Response) {
  mockStreamText.mockReturnValue({
    toTextStreamResponse: vi.fn().mockReturnValue(streamResponse),
  } as never);
}

describe('POST /api/creative/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = makeRequest({ audience_id: TEST_AUDIENCE_ID, type: 'persona' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 for missing audience_id', async () => {
    mockAuth();

    const req = makeRequest({ type: 'persona' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    mockAuth();

    const req = makeRequest({ audience_id: TEST_AUDIENCE_ID, type: 'invalid' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for non-uuid audience_id', async () => {
    mockAuth();

    const req = makeRequest({ audience_id: 'not-a-uuid', type: 'persona' });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 404 when audience does not exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = makeRequest({ audience_id: TEST_AUDIENCE_ID, type: 'persona' });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });

  it('returns 403 when audience belongs to another user', async () => {
    mockAuth('other-user');
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = makeRequest({ audience_id: TEST_AUDIENCE_ID, type: 'persona' });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('calls streamText and returns streaming response for persona type', async () => {
    mockAuth();

    const audienceSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    const summarySelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    const respondentSelectChain = {
      from: vi.fn().mockResolvedValue([]),
    };

    let callCount = 0;
    mockDbSelect.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return audienceSelectChain as never;
      if (callCount === 2) return summarySelectChain as never;
      return respondentSelectChain as never;
    });

    const fakeStreamResponse = new Response('streaming data', { status: 200 });
    mockStreamResponse(fakeStreamResponse);

    const req = makeRequest({ audience_id: TEST_AUDIENCE_ID, type: 'persona' });
    const res = await POST(req);

    expect(mockStreamText).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
  });
});
