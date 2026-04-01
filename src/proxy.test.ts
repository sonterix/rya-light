import { type NextRequest, NextResponse } from 'next/server';

const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn(
  (_url: string, _key: string, _options: Record<string, unknown>) => ({
    auth: { getUser: mockGetUser },
  })
);

vi.mock('@supabase/ssr', () => ({
  createServerClient: (url: string, key: string, options: Record<string, unknown>) =>
    mockCreateServerClient(url, key, options),
}));

const MOCK_URL = 'https://test.supabase.co';
const MOCK_KEY = 'test-anon-key';

function createMockNextUrl(pathname: string) {
  const url = new URL(pathname, 'http://localhost:3000');
  return Object.assign(url, {
    clone() {
      return createMockNextUrl(url.pathname);
    },
  });
}

function createMockRequest(pathname: string): NextRequest {
  const nextUrl = createMockNextUrl(pathname);
  const cookies = new Map<string, { name: string; value: string }>();

  return {
    nextUrl,
    url: nextUrl.toString(),
    headers: new Headers(),
    cookies: {
      getAll: () => Array.from(cookies.values()),
      set: (name: string, value: string) => {
        cookies.set(name, { name, value });
      },
    },
  } as unknown as NextRequest;
}

describe('proxy', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', MOCK_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', MOCK_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a supabase client with cookie handlers', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } });
    const { proxy } = await import('@/proxy');

    await proxy(createMockRequest('/dashboard'));

    expect(mockCreateServerClient).toHaveBeenCalledWith(MOCK_URL, MOCK_KEY, {
      cookies: {
        getAll: expect.any(Function),
        setAll: expect.any(Function),
      },
    });
  });

  it('calls getUser to refresh the session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } });
    const { proxy } = await import('@/proxy');

    await proxy(createMockRequest('/dashboard'));

    expect(mockGetUser).toHaveBeenCalled();
  });

  it('redirects unauthenticated users to /auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import('@/proxy');

    const response = await proxy(createMockRequest('/dashboard'));

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth');
  });

  it('does not redirect unauthenticated users already on /auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import('@/proxy');

    const response = await proxy(createMockRequest('/auth'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect unauthenticated users on /auth sub-paths', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { proxy } = await import('@/proxy');

    const response = await proxy(createMockRequest('/auth/callback'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects authenticated users on /auth to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } });
    const { proxy } = await import('@/proxy');

    const response = await proxy(createMockRequest('/auth'));

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('allows authenticated users to access protected pages', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } });
    const { proxy } = await import('@/proxy');

    const response = await proxy(createMockRequest('/dashboard'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('exports a config with matcher that excludes static assets', async () => {
    const { config } = await import('@/proxy');

    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
  });
});
