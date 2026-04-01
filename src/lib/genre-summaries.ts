export interface GenreInterestEntry {
  genreSlug: string;
  interestLevel: number;
}

export interface GenreSummary {
  genreSlug: string;
  avgInterest: number;
  pctHighlyInterested: number;
  respondentCount: number;
}

const HIGHLY_INTERESTED_THRESHOLD = 4;

export function computeGenreSummaries(
  interests: GenreInterestEntry[],
): GenreSummary[] {
  const grouped = new Map<string, number[]>();

  for (const entry of interests) {
    const existing = grouped.get(entry.genreSlug);
    if (existing) {
      existing.push(entry.interestLevel);
    } else {
      grouped.set(entry.genreSlug, [entry.interestLevel]);
    }
  }

  const summaries: GenreSummary[] = [];

  for (const [genreSlug, levels] of grouped.entries()) {
    const respondentCount = levels.length;
    const avgInterest =
      levels.reduce((sum, level) => sum + level, 0) / respondentCount;
    const highlyInterestedCount = levels.filter(
      (level) => level >= HIGHLY_INTERESTED_THRESHOLD,
    ).length;
    const pctHighlyInterested = highlyInterestedCount / respondentCount;

    summaries.push({
      genreSlug,
      avgInterest,
      pctHighlyInterested,
      respondentCount,
    });
  }

  return summaries;
}
