import { createServerClient } from '@supabase/ssr';

const mockCookieStore = {
  getAll: vi.fn(() => [{ name: 'sb-token', value: 'abc123' }]),
  set: vi.fn(),
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const MOCK_URL = 'https://test.supabase.co';
const MOCK_KEY = 'test-anon-key';

describe('createClient (server)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', MOCK_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', MOCK_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is async and returns a supabase client', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const client = await createClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty('auth');
  });

  it('calls createServerClient with env vars and cookie handlers', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    await createClient();

    expect(createServerClient).toHaveBeenCalledWith(MOCK_URL, MOCK_KEY, {
      cookies: {
        getAll: expect.any(Function),
        setAll: expect.any(Function),
      },
    });
  });

  it('getAll reads from the cookie store', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    await createClient();

    const callArgs = vi.mocked(createServerClient).mock.calls[0];
    const cookieHandlers = callArgs[2].cookies as {
      getAll: () => { name: string; value: string }[];
      setAll: (
        cookies: { name: string; value: string; options: Record<string, unknown> }[],
        headers: Record<string, string>
      ) => void;
    };
    const result = cookieHandlers.getAll();

    expect(mockCookieStore.getAll).toHaveBeenCalled();
    expect(result).toEqual([{ name: 'sb-token', value: 'abc123' }]);
  });

  it('setAll writes each cookie to the cookie store', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    await createClient();

    const callArgs = vi.mocked(createServerClient).mock.calls[0];
    const cookieHandlers = callArgs[2].cookies as {
      getAll: () => { name: string; value: string }[];
      setAll: (
        cookies: { name: string; value: string; options: Record<string, unknown> }[],
        headers: Record<string, string>
      ) => void;
    };

    const cookiesToSet = [
      { name: 'sb-access', value: 'token1', options: { path: '/' } },
      { name: 'sb-refresh', value: 'token2', options: { path: '/' } },
    ];

    cookieHandlers.setAll(cookiesToSet, {});

    expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    expect(mockCookieStore.set).toHaveBeenCalledWith('sb-access', 'token1', { path: '/' });
    expect(mockCookieStore.set).toHaveBeenCalledWith('sb-refresh', 'token2', { path: '/' });
  });
});
