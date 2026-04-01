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
  creativeOutputs: {
    userId: 'userId',
    audienceId: 'audienceId',
    type: 'type',
    createdAt: 'createdAt',
  },
}));

import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { GET } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);

const TEST_USER_ID = 'user-123';
const TEST_OUTPUT = {
  id: 'out-1',
  userId: TEST_USER_ID,
  audienceId: 'aud-1',
  type: 'persona',
  content: { name: 'Alex', tagline: 'The Explorer' },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function mockAuth(userId = TEST_USER_ID) {
  mockGetAuthUser.mockResolvedValue({
    user: { id: userId, email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

describe('GET /api/creative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/creative');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns all creative outputs for user', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/creative');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('out-1');
  });

  it('returns empty array when no outputs exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/creative');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('returns 400 for invalid type param', async () => {
    mockAuth();

    const req = new NextRequest('http://localhost/api/creative?type=invalid');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid audience_id param', async () => {
    mockAuth();

    const req = new NextRequest('http://localhost/api/creative?audience_id=not-a-uuid');
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it('accepts valid type and audience_id query params', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest(
      'http://localhost/api/creative?type=persona&audience_id=550e8400-e29b-41d4-a716-446655440000',
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
