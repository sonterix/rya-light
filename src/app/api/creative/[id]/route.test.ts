import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  creativeOutputs: {
    id: 'id',
    userId: 'userId',
  },
}));

import { db } from '@/db';
import { getAuthUser } from '@/lib/supabase/auth';

import { DELETE, GET, PATCH } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);
const mockDbDelete = vi.mocked(db.delete);
const mockDbUpdate = vi.mocked(db.update);

const TEST_USER_ID = 'user-123';
const OTHER_USER_ID = 'user-456';
const TEST_OUTPUT = {
  id: 'out-1',
  userId: TEST_USER_ID,
  audienceId: 'aud-1',
  type: 'persona',
  content: { name: 'Alex' },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function mockAuth(userId = TEST_USER_ID) {
  mockGetAuthUser.mockResolvedValue({
    user: { id: userId, email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/creative/${id}`, { method: 'DELETE' });
}

describe('DELETE /api/creative/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await DELETE(makeRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when output does not exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await DELETE(makeRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(404);
  });

  it('returns 403 when output belongs to another user', async () => {
    mockAuth(OTHER_USER_ID);
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await DELETE(makeRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(403);
  });

  it('deletes output and returns success', async () => {
    mockAuth();
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockSelectChain as never);

    const mockDeleteChain = {
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbDelete.mockReturnValue(mockDeleteChain as never);

    const res = await DELETE(makeRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { success: true } });
  });
});

describe('GET /api/creative/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeGetRequest(id: string) {
    return new NextRequest(`http://localhost/api/creative/${id}`, { method: 'GET' });
  }

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await GET(makeGetRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when output does not exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await GET(makeGetRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(404);
  });

  it('returns 403 when output belongs to another user', async () => {
    mockAuth(OTHER_USER_ID);
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await GET(makeGetRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(403);
  });

  it('returns the output when owned by user', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await GET(makeGetRequest('out-1'), { params: Promise.resolve({ id: 'out-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('out-1');
  });
});

describe('PATCH /api/creative/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makePatchRequest(id: string, body: unknown) {
    return new NextRequest(`http://localhost/api/creative/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await PATCH(
      makePatchRequest('out-1', { content: { name: 'Updated' } }),
      { params: Promise.resolve({ id: 'out-1' }) },
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when body is missing content field', async () => {
    mockAuth();

    const res = await PATCH(
      makePatchRequest('out-1', {}),
      { params: Promise.resolve({ id: 'out-1' }) },
    );

    expect(res.status).toBe(400);
  });

  it('returns 404 when output does not exist', async () => {
    mockAuth();
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await PATCH(
      makePatchRequest('out-1', { content: { name: 'Updated' } }),
      { params: Promise.resolve({ id: 'out-1' }) },
    );

    expect(res.status).toBe(404);
  });

  it('returns 403 when output belongs to another user', async () => {
    mockAuth(OTHER_USER_ID);
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockChain as never);

    const res = await PATCH(
      makePatchRequest('out-1', { content: { name: 'Updated' } }),
      { params: Promise.resolve({ id: 'out-1' }) },
    );

    expect(res.status).toBe(403);
  });

  it('updates content and returns updated record', async () => {
    mockAuth();
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_OUTPUT]),
    };
    mockDbSelect.mockReturnValue(mockSelectChain as never);

    const updatedOutput = { ...TEST_OUTPUT, content: { name: 'Updated' } };
    const mockUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([updatedOutput]),
    };
    mockDbUpdate.mockReturnValue(mockUpdateChain as never);

    const res = await PATCH(
      makePatchRequest('out-1', { content: { name: 'Updated' } }),
      { params: Promise.resolve({ id: 'out-1' }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.content).toEqual({ name: 'Updated' });
  });
});
