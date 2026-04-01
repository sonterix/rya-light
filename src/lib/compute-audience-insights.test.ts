vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  respondentGenreInterests: { respondentId: 'respondentId', genreSlug: 'genreSlug', interestLevel: 'interestLevel' },
  audienceGenreSummaries: { audienceId: 'audienceId', id: 'id' },
}));

vi.mock('@/lib/genre-summaries', () => ({
  computeGenreSummaries: vi.fn(),
}));

import { db } from '@/db';
import { computeGenreSummaries } from '@/lib/genre-summaries';

import { computeAndSaveAudienceInsights } from './compute-audience-insights';

const mockDbSelect = vi.mocked(db.select);
const mockDbDelete = vi.mocked(db.delete);
const mockDbInsert = vi.mocked(db.insert);
const mockComputeGenreSummaries = vi.mocked(computeGenreSummaries);

const TEST_AUDIENCE_ID = 'aud-1';
const TEST_RESPONDENT_IDS = [1, 2, 3];

describe('computeAndSaveAudienceInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches genre interests for the given respondent IDs', async () => {
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([]);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, TEST_RESPONDENT_IDS);

    expect(mockDbSelect).toHaveBeenCalled();
    expect(interestsChain.from).toHaveBeenCalled();
    expect(interestsChain.where).toHaveBeenCalled();
  });

  it('calls computeGenreSummaries with fetched interest entries', async () => {
    const rawInterests = [
      { respondentId: 1, genreSlug: 'RQ.2.34', interestLevel: 4 },
      { respondentId: 2, genreSlug: 'RQ.2.34', interestLevel: 3 },
    ];
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(rawInterests),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([]);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, [1, 2]);

    expect(mockComputeGenreSummaries).toHaveBeenCalledWith([
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.34', interestLevel: 3 },
    ]);
  });

  it('deletes old summaries for the audience before inserting new ones', async () => {
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([]);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, []);

    expect(mockDbDelete).toHaveBeenCalled();
    expect(deleteChain.where).toHaveBeenCalled();
  });

  it('inserts computed summaries for the audience', async () => {
    const rawInterests = [
      { respondentId: 1, genreSlug: 'RQ.2.34', interestLevel: 4 },
    ];
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(rawInterests),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([
      { genreSlug: 'RQ.2.34', avgInterest: 4, pctHighlyInterested: 1, respondentCount: 1 },
    ]);

    const insertChain = {
      values: vi.fn().mockResolvedValue(undefined),
    };
    mockDbInsert.mockReturnValueOnce(insertChain as never);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, [1]);

    expect(mockDbInsert).toHaveBeenCalled();
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          audienceId: TEST_AUDIENCE_ID,
          genreSlug: 'RQ.2.34',
        }),
      ]),
    );
  });

  it('skips insert when no summaries are computed', async () => {
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([]);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, []);

    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it('skips insert when respondent list is empty', async () => {
    const interestsChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    mockDbSelect.mockReturnValueOnce(interestsChain as never);

    const deleteChain = {
      where: vi.fn().mockResolvedValue(undefined),
    };
    mockDbDelete.mockReturnValueOnce(deleteChain as never);

    mockComputeGenreSummaries.mockReturnValue([]);

    await computeAndSaveAudienceInsights(TEST_AUDIENCE_ID, []);

    expect(mockDbInsert).not.toHaveBeenCalled();
  });
});
