import { NextRequest } from 'next/server';

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
  audiences: { userId: 'userId', updatedAt: 'updatedAt' },
}));


import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { GET, POST } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);
const mockDbInsert = vi.mocked(db.insert);

const TEST_USER_ID = 'user-123';
const TEST_AUDIENCE = {
  id: 'aud-1',
  userId: TEST_USER_ID,
  name: 'My Audience',
  filters: { gender: ['Female'] },
  manualIncludes: [],
  manualExcludes: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function mockAuth(userId = TEST_USER_ID) {
  mockGetAuthUser.mockResolvedValue({
    user: { id: userId, email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

describe('GET /api/audiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/audiences');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns audiences ordered by updatedAt desc', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/audiences');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('aud-1');
  });

  it('returns empty array when user has no audiences', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/audiences');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('POST /api/audiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/audiences', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when name is missing', async () => {
    mockAuth();

    const req = new NextRequest('http://localhost/api/audiences', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('creates audience with provided name and filters', async () => {
    mockAuth();
    const created = { ...TEST_AUDIENCE, name: 'New Audience' };
    const mockChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([created]),
    };
    mockDbInsert.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/audiences', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Audience',
        filters: { gender: ['Female'] },
        manualIncludes: [],
        manualExcludes: [],
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe('New Audience');
  });

  it('creates audience with only name', async () => {
    mockAuth();
    const created = { ...TEST_AUDIENCE, filters: null, manualIncludes: [], manualExcludes: [] };
    const mockChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([created]),
    };
    mockDbInsert.mockReturnValue(mockChain as never);

    const req = new NextRequest('http://localhost/api/audiences', {
      method: 'POST',
      body: JSON.stringify({ name: 'Minimal Audience' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  it('returns 400 when name is empty string', async () => {
    mockAuth();

    const req = new NextRequest('http://localhost/api/audiences', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
