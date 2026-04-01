import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

import { getAuthUser } from '@/lib/supabase/auth';

import { GET } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);

function mockAuth() {
  mockGetAuthUser.mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

describe('GET /api/config/openai-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/config/openai-status');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns configured: false when OPENAI_API_KEY is not set', async () => {
    mockAuth();
    delete process.env.OPENAI_API_KEY;

    const req = new NextRequest('http://localhost/api/config/openai-status');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { configured: false } });
  });

  it('returns configured: true when OPENAI_API_KEY is set', async () => {
    mockAuth();
    process.env.OPENAI_API_KEY = 'sk-test-key';

    const req = new NextRequest('http://localhost/api/config/openai-status');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { configured: true } });

    delete process.env.OPENAI_API_KEY;
  });
});
