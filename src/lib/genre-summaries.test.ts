import { computeGenreSummaries } from './genre-summaries';
import type { GenreInterestEntry, GenreSummary } from './genre-summaries';

function findSummary(summaries: GenreSummary[], slug: string): GenreSummary {
  const summary = summaries.find((s) => s.genreSlug === slug);
  if (!summary) throw new Error(`No summary found for ${slug}`);
  return summary;
}

describe('computeGenreSummaries', () => {
  it('returns empty array for empty input', () => {
    expect(computeGenreSummaries([])).toEqual([]);
  });

  it('computes avg interest correctly for a single respondent', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
    ];
    const [summary] = computeGenreSummaries(interests);
    expect(summary.avgInterest).toBe(4);
    expect(summary.respondentCount).toBe(1);
  });

  it('computes avg interest correctly for multiple respondents', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.34', interestLevel: 3 },
    ];
    const [summary] = computeGenreSummaries(interests);
    expect(summary.avgInterest).toBeCloseTo(11 / 3);
    expect(summary.respondentCount).toBe(3);
  });

  it('counts highly interested respondents (interest_level >= 4)', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.57', interestLevel: 5 },
      { genreSlug: 'RQ.2.57', interestLevel: 4 },
      { genreSlug: 'RQ.2.57', interestLevel: 3 },
    ];
    const [summary] = computeGenreSummaries(interests);
    expect(summary.pctHighlyInterested).toBeCloseTo(2 / 3);
  });

  it('returns 0 pctHighlyInterested when no one rates >= 4', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.97', interestLevel: 1 },
      { genreSlug: 'RQ.2.97', interestLevel: 2 },
      { genreSlug: 'RQ.2.97', interestLevel: 3 },
    ];
    const [summary] = computeGenreSummaries(interests);
    expect(summary.pctHighlyInterested).toBe(0);
  });

  it('returns 1 pctHighlyInterested when everyone rates >= 4', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.57', interestLevel: 5 },
      { genreSlug: 'RQ.2.57', interestLevel: 4 },
      { genreSlug: 'RQ.2.57', interestLevel: 5 },
    ];
    const [summary] = computeGenreSummaries(interests);
    expect(summary.pctHighlyInterested).toBe(1);
  });

  it('groups interests by genre slug producing one summary per genre', () => {
    const interests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.38', interestLevel: 2 },
      { genreSlug: 'RQ.2.34', interestLevel: 3 },
    ];
    const summaries = computeGenreSummaries(interests);
    expect(summaries).toHaveLength(2);
  });

  it('matches seed data values for Wellness-Oriented Parents', () => {
    const wellnessParentsInterests: GenreInterestEntry[] = [
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.34', interestLevel: 4 },
      { genreSlug: 'RQ.2.34', interestLevel: 3 },
      { genreSlug: 'RQ.2.38', interestLevel: 1 },
      { genreSlug: 'RQ.2.38', interestLevel: 2 },
      { genreSlug: 'RQ.2.38', interestLevel: 1 },
      { genreSlug: 'RQ.2.48', interestLevel: 2 },
      { genreSlug: 'RQ.2.48', interestLevel: 3 },
      { genreSlug: 'RQ.2.48', interestLevel: 2 },
      { genreSlug: 'RQ.2.57', interestLevel: 5 },
      { genreSlug: 'RQ.2.57', interestLevel: 4 },
      { genreSlug: 'RQ.2.57', interestLevel: 5 },
      { genreSlug: 'RQ.2.78', interestLevel: 2 },
      { genreSlug: 'RQ.2.78', interestLevel: 2 },
      { genreSlug: 'RQ.2.78', interestLevel: 2 },
      { genreSlug: 'RQ.2.97', interestLevel: 1 },
      { genreSlug: 'RQ.2.97', interestLevel: 1 },
      { genreSlug: 'RQ.2.97', interestLevel: 1 },
      { genreSlug: 'RQ.2.125', interestLevel: 4 },
      { genreSlug: 'RQ.2.125', interestLevel: 4 },
      { genreSlug: 'RQ.2.125', interestLevel: 4 },
      { genreSlug: 'RQ.2.162', interestLevel: 2 },
      { genreSlug: 'RQ.2.162', interestLevel: 2 },
      { genreSlug: 'RQ.2.162', interestLevel: 2 },
      { genreSlug: 'RQ.2.172', interestLevel: 3 },
      { genreSlug: 'RQ.2.172', interestLevel: 3 },
      { genreSlug: 'RQ.2.172', interestLevel: 2 },
      { genreSlug: 'RQ.2.173', interestLevel: 1 },
      { genreSlug: 'RQ.2.173', interestLevel: 1 },
      { genreSlug: 'RQ.2.173', interestLevel: 1 },
    ];

    const summaries = computeGenreSummaries(wellnessParentsInterests);

    const coding = findSummary(summaries, 'RQ.2.34');
    expect(coding.avgInterest).toBeCloseTo(11 / 3);
    expect(coding.pctHighlyInterested).toBeCloseTo(2 / 3);
    expect(coding.respondentCount).toBe(3);

    const cooking = findSummary(summaries, 'RQ.2.38');
    expect(cooking.avgInterest).toBeCloseTo(4 / 3);
    expect(cooking.pctHighlyInterested).toBe(0);

    const fantasy = findSummary(summaries, 'RQ.2.57');
    expect(fantasy.avgInterest).toBeCloseTo(14 / 3);
    expect(fantasy.pctHighlyInterested).toBe(1);

    const meditation = findSummary(summaries, 'RQ.2.97');
    expect(meditation.avgInterest).toBe(1);
    expect(meditation.pctHighlyInterested).toBe(0);

    const reality = findSummary(summaries, 'RQ.2.125');
    expect(reality.avgInterest).toBe(4);
    expect(reality.pctHighlyInterested).toBe(1);

    const yoga = findSummary(summaries, 'RQ.2.173');
    expect(yoga.avgInterest).toBe(1);
    expect(yoga.pctHighlyInterested).toBe(0);
  });
});
