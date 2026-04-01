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
  genres: {},
}));

import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { GET } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);

const TEST_GENRE = {
  genreSlug: 'rock',
  genreName: 'Rock',
  genreCategories: ['Music'],
};

function mockAuth() {
  mockGetAuthUser.mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

describe('GET /api/genres', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/genres');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns all genres', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockResolvedValue([TEST_GENRE]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/genres');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].genreSlug).toBe('rock');
  });

  it('returns empty array when no genres exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/genres');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
