import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      audiences: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock('@/db/schema', () => ({
  audiences: { id: 'id', userId: 'userId' },
  respondents: {},
}));


vi.mock('@/lib/filter-matching', () => ({
  applyFilters: vi.fn(),
}));

vi.mock('@/lib/compute-audience-insights', () => ({
  computeAndSaveAudienceInsights: vi.fn(),
}));

import { db } from '@/db';
import { computeAndSaveAudienceInsights } from '@/lib/compute-audience-insights';
import { applyFilters } from '@/lib/filter-matching';
import { getAuthUser } from '@/lib/supabase/auth';

import { DELETE, GET, PATCH } from './route';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockDbSelect = vi.mocked(db.select);
const mockDbUpdate = vi.mocked(db.update);
const mockDbDelete = vi.mocked(db.delete);
const mockApplyFilters = vi.mocked(applyFilters);
const mockComputeAndSaveAudienceInsights = vi.mocked(computeAndSaveAudienceInsights);

const TEST_USER_ID = 'user-123';
const TEST_AUDIENCE_ID = 'aud-1';
const TEST_AUDIENCE = {
  id: TEST_AUDIENCE_ID,
  userId: TEST_USER_ID,
  name: 'My Audience',
  filters: { gender: ['Female'] },
  manualIncludes: [],
  manualExcludes: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};
const TEST_RESPONDENT = {
  respondentId: 1,
  wave: 1,
  waveId: 1,
  weight: '1.0',
  audienceCategory: 'Wellness-Oriented Parents',
  age: 35,
  gender: 'Female',
  ethnicity: 'White',
  region: 'South',
  communityType: 'Suburban',
  maritalStatus: 'Married',
  householdSize: 3,
  education: "Bachelor's Degree",
  employmentStatus: 'Employed',
  householdIncomeUsd: 75000,
  investableAssetsUsd: 50000,
  zipCode: '12345',
  state: 'TX',
  dma: 'Austin',
  parentStatus: 'Parent',
  politicalAffiliation: 'Independent',
  homeOwnership: 'Own',
};

function mockAuth(userId = TEST_USER_ID) {
  mockGetAuthUser.mockResolvedValue({
    user: { id: userId, email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
  });
}

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/audiences/${id}`);
}

describe('GET /api/audiences/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), { params: Promise.resolve({ id: TEST_AUDIENCE_ID }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when audience does not exist', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await GET(makeRequest('nonexistent'), { params: Promise.resolve({ id: 'nonexistent' }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Audience not found' });
  });

  it('returns 403 when audience belongs to another user', async () => {
    mockAuth('other-user');
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ ...TEST_AUDIENCE, userId: TEST_USER_ID }]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), { params: Promise.resolve({ id: TEST_AUDIENCE_ID }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('returns audience config and matching respondents', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    const respondentChain = {
      from: vi.fn().mockResolvedValue([TEST_RESPONDENT]),
    };
    mockDbSelect
      .mockReturnValueOnce(audienceChain as never)
      .mockReturnValueOnce(respondentChain as never);

    mockApplyFilters.mockReturnValue([TEST_RESPONDENT]);

    const res = await GET(makeRequest(TEST_AUDIENCE_ID), { params: Promise.resolve({ id: TEST_AUDIENCE_ID }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.audience.id).toBe(TEST_AUDIENCE_ID);
    expect(body.data.respondents).toHaveLength(1);
    expect(body.data.respondents[0].respondentId).toBe(1);
  });

  it('calls applyFilters with correct arguments', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    const respondentChain = {
      from: vi.fn().mockResolvedValue([TEST_RESPONDENT]),
    };
    mockDbSelect
      .mockReturnValueOnce(audienceChain as never)
      .mockReturnValueOnce(respondentChain as never);

    mockApplyFilters.mockReturnValue([]);

    await GET(makeRequest(TEST_AUDIENCE_ID), { params: Promise.resolve({ id: TEST_AUDIENCE_ID }) });

    expect(mockApplyFilters).toHaveBeenCalledWith({
      filters: TEST_AUDIENCE.filters,
      manualIncludes: TEST_AUDIENCE.manualIncludes,
      manualExcludes: TEST_AUDIENCE.manualExcludes,
      respondents: [TEST_RESPONDENT],
    });
  });
});

function makePatchRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost/api/audiences/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/audiences/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await PATCH(makePatchRequest(TEST_AUDIENCE_ID, { name: 'New Name' }), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when audience does not exist', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await PATCH(makePatchRequest('nonexistent', { name: 'New Name' }), {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Audience not found' });
  });

  it('returns 403 when audience belongs to another user', async () => {
    mockAuth('other-user');
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ ...TEST_AUDIENCE, userId: TEST_USER_ID }]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await PATCH(makePatchRequest(TEST_AUDIENCE_ID, { name: 'New Name' }), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('returns 400 when name is empty string', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await PATCH(makePatchRequest(TEST_AUDIENCE_ID, { name: '' }), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/name is required/i);
  });

  it('updates the audience and returns the updated record', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const updatedAudience = { ...TEST_AUDIENCE, name: 'Updated Name' };
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updatedAudience]),
    };
    mockDbUpdate.mockReturnValueOnce(updateChain as never);

    const respondentsChain = {
      from: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(respondentsChain as never);

    mockApplyFilters.mockReturnValue([]);
    mockComputeAndSaveAudienceInsights.mockResolvedValue(undefined);

    const res = await PATCH(makePatchRequest(TEST_AUDIENCE_ID, { name: 'Updated Name' }), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('Updated Name');
  });

  it('triggers genre insights computation after updating audience', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const updatedAudience = { ...TEST_AUDIENCE, name: 'Updated Name' };
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updatedAudience]),
    };
    mockDbUpdate.mockReturnValueOnce(updateChain as never);

    const respondentsChain = {
      from: vi.fn().mockResolvedValue([TEST_RESPONDENT]),
    };
    mockDbSelect.mockReturnValueOnce(respondentsChain as never);

    mockApplyFilters.mockReturnValue([TEST_RESPONDENT]);
    mockComputeAndSaveAudienceInsights.mockResolvedValue(undefined);

    await PATCH(makePatchRequest(TEST_AUDIENCE_ID, { name: 'Updated Name' }), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(mockComputeAndSaveAudienceInsights).toHaveBeenCalledWith(
      TEST_AUDIENCE_ID,
      [TEST_RESPONDENT.respondentId],
    );
  });
});

function makeDeleteRequest(id: string) {
  return new NextRequest(`http://localhost/api/audiences/${id}`, {
    method: 'DELETE',
  });
}

describe('DELETE /api/audiences/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when audience does not exist', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await DELETE(makeDeleteRequest('nonexistent'), {
      params: Promise.resolve({ id: 'nonexistent' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Audience not found' });
  });

  it('returns 403 when audience belongs to another user', async () => {
    mockAuth('other-user');
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ ...TEST_AUDIENCE, userId: TEST_USER_ID }]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const res = await DELETE(makeDeleteRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: 'Forbidden' });
  });

  it('deletes the audience and returns success', async () => {
    mockAuth();
    const audienceChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([TEST_AUDIENCE]),
    };
    mockDbSelect.mockReturnValueOnce(audienceChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    const res = await DELETE(makeDeleteRequest(TEST_AUDIENCE_ID), {
      params: Promise.resolve({ id: TEST_AUDIENCE_ID }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { success: true } });
    expect(mockDbDelete).toHaveBeenCalled();
  });
});
