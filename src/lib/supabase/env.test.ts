describe('getSupabaseEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns url and anonKey when both env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');

    const { getSupabaseEnv } = await import('@/lib/supabase/env');
    const result = getSupabaseEnv();

    expect(result).toEqual({
      url: 'https://test.supabase.co',
      anonKey: 'test-key',
    });
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const { getSupabaseEnv } = await import('@/lib/supabase/env');

    expect(() => getSupabaseEnv()).toThrow('NEXT_PUBLIC_SUPABASE_URL is not set');
  });

  it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseEnv } = await import('@/lib/supabase/env');

    expect(() => getSupabaseEnv()).toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  });
});
