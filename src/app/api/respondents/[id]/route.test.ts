import { NextRequest } from 'next/server';

const mockGetAuthUser = vi.fn();
const mockSelect = vi.fn();

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
  respondentGenreInterests: {
    respondentId: 'respondent_id',
    genreSlug: 'genre_slug',
    interestLevel: 'interest_level',
  },
  genres: { genreSlug: 'genre_slug', genreName: 'genre_name' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
}));

const mockRespondent = {
  respondentId: 1,
  wave: 1,
  waveId: 101,
  weight: '1.2',
  audienceCategory: 'Mainstream Sports Fan',
  age: 35,
  gender: 'Male',
  ethnicity: 'White',
  region: 'West',
  communityType: 'Suburban',
  maritalStatus: 'Married',
  householdSize: 3,
  education: "Bachelor's Degree",
  employmentStatus: 'Employed full-time',
  householdIncomeUsd: 118000,
  investableAssetsUsd: 50000,
  zipCode: '90210',
  state: 'CA',
  dma: 'Los Angeles',
  parentStatus: 'Not a parent',
  politicalAffiliation: 'Independent',
  homeOwnership: 'Own',
};

const mockInterests = [
  { genreSlug: 'action', genreName: 'Action', interestLevel: 5 },
  { genreSlug: 'comedy', genreName: 'Comedy', interestLevel: 3 },
];

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/respondents/${id}`);
}

describe('GET /api/respondents/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const { GET } = await import('./route');
    const response = await GET(makeRequest('1'), { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when id is not a positive integer', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const { GET } = await import('./route');
    const response = await GET(makeRequest('abc'), { params: Promise.resolve({ id: 'abc' }) });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 404 when respondent does not exist', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const respondentChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockSelect
      .mockReturnValueOnce(respondentChain)
      .mockReturnValueOnce(interestsChain);

    const { GET } = await import('./route');
    const response = await GET(makeRequest('999'), { params: Promise.resolve({ id: '999' }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: 'Respondent not found' });
  });

  it('returns full respondent data with genre interests', async () => {
    mockGetAuthUser.mockResolvedValue({ user: { id: 'user-1' } });

    const respondentChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockRespondent]),
    };
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(mockInterests),
    };

    mockSelect
      .mockReturnValueOnce(respondentChain)
      .mockReturnValueOnce(interestsChain);

    const { GET } = await import('./route');
    const response = await GET(makeRequest('1'), { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.respondent).toMatchObject({ respondentId: 1 });
    expect(body.data.genreInterests).toHaveLength(2);
    expect(body.data.genreInterests[0]).toHaveProperty('genreName', 'Action');
  });
});
