import { createBrowserClient } from '@supabase/ssr';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}));

const MOCK_URL = 'https://test.supabase.co';
const MOCK_KEY = 'test-anon-key';

describe('createClient (browser)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', MOCK_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', MOCK_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls createBrowserClient with env vars', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    createClient();

    expect(createBrowserClient).toHaveBeenCalledWith(MOCK_URL, MOCK_KEY);
  });

  it('returns the supabase client instance', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty('auth');
  });
});
