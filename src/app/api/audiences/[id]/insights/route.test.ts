import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  audiences: { id: 'id', userId: 'userId' },
  audienceGenreSummaries: { audienceId: 'audienceId', avgInterest: 'avgInterest' },
  genres: { genreSlug: 'genreSlug', genreName: 'genreName' },
}));

import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { GET } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);

const TEST_USER_ID = 'user-123';
const TEST_AUDIENCE_ID = 'aud-1';
const TEST_AUDIENCE = {
  id: TEST_AUDIENCE_ID,
  userId: TEST_USER_ID,
  name: 'My Audience',
  filters: null,
  manualIncludes: [],
  manualExcludes: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const TEST_GENRE_SUMMARIES = [
  {
    genreSlug: 'RQ.2.34',
    genreName: 'Cooking / Baking',
    avgInterest: '1.3',
    pctHighlyInterested: '1.0',
    respondentCount: 3,
  },
  {
    genreSlug: 'RQ.2.38',
    genreName: 'Fantasy',
    avgInterest: '2.5',
    pctHighlyInterested: '0.5',
    respondentCount: 2,
  },
];

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

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/audiences/${id}/insights`);
}

describe('GET /api/audiences/[id]/insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when audience does not exist', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await GET(makeRequest('nonexistent'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Audience not found' });
  });

  it('returns 403 when audience belongs to another user', async () => {
    mockAuth('other-user');
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ ...TEST_AUDIENCE, userId: TEST_USER_ID }]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('returns genre summaries sorted by avg_interest ascending', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const summariesChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(TEST_GENRE_SUMMARIES),
    };
    mockDbSelect.mockReturnValueOnce(summariesChain as never);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].genreSlug).toBe('RQ.2.34');
    expect(body.data[0].genreName).toBe('Cooking / Baking');
    expect(body.data[0].avgInterest).toBe('1.3');
    expect(body.data[0].pctHighlyInterested).toBe('1.0');
    expect(body.data[0].respondentCount).toBe(3);
  });

  it('returns empty array when no summaries exist', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const summariesChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(summariesChain as never);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
