import { NextRequest } from 'next/server';

const mockGetAuthUser = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockOffset = vi.fn();

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: mockGetAuthUser,
}));

vi.mock('@/db', () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock('@/db/schema', () => ({
  respondents: { respondentId: 'respondent_id' },
}));

const makeChain = (result: unknown) => {
  const chain = {
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnValue(Promise.resolve(result)),
  };
  return chain;
};

const makeCountChain = (result: unknown) => {
  const chain = {
    from: vi.fn().mockReturnValue(Promise.resolve(result)),
  };
  return chain;
};

function makeRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/respondents');
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return new NextRequest(url);
}

const mockRespondents = [
  {
    respondentId: 1,
    audienceCategory: 'Mainstream Sports Fan',
    age: 35,
    gender: 'Male',
    region: 'West',
    state: 'CA',
    householdIncomeUsd: 118000,
  },
];

describe('GET /api/respondents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns paginated respondents on page 1 by default', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const listChain = makeChain(mockRespondents);
    const countChain = makeCountChain([{ count: 1 }]);

    mockSelect
      .mockReturnValueOnce(listChain)
      .mockReturnValueOnce(countChain);

    const { GET } = await import('./route');
    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.respondents).toHaveLength(1);
    expect(body.data.pagination.page).toBe(1);
    expect(body.data.pagination.pageSize).toBe(10);
    expect(body.data.pagination.total).toBe(1);
    expect(body.data.pagination.totalPages).toBe(1);
  });

  it('returns correct page when page param is provided', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const listChain = makeChain([]);
    const countChain = makeCountChain([{ count: 25 }]);

    mockSelect
      .mockReturnValueOnce(listChain)
      .mockReturnValueOnce(countChain);

    const { GET } = await import('./route');
    const response = await GET(makeRequest({ page: '3' }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.pagination.page).toBe(3);
    expect(body.data.pagination.totalPages).toBe(3);
    expect(listChain.offset).toHaveBeenCalledWith(20);
  });

  it('returns 400 when page param is not a positive integer', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const { GET } = await import('./route');
    const response = await GET(makeRequest({ page: '0' }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when page param is not a number', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const { GET } = await import('./route');
    const response = await GET(makeRequest({ page: 'abc' }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
