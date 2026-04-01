import { inArray, eq } from 'drizzle-orm';

import { db } from '@/db';
import { audienceGenreSummaries, respondentGenreInterests } from '@/db/schema';
import { computeGenreSummaries } from '@/lib/genre-summaries';

export async function computeAndSaveAudienceInsights(
  audienceId: string,
  respondentIds: number[],
): Promise<void> {
  const rawInterests =
    respondentIds.length > 0
      ? await db
          .select({
            respondentId: respondentGenreInterests.respondentId,
            genreSlug: respondentGenreInterests.genreSlug,
            interestLevel: respondentGenreInterests.interestLevel,
          })
          .from(respondentGenreInterests)
          .where(inArray(respondentGenreInterests.respondentId, respondentIds))
      : [];

  const entries = rawInterests.map((r) => ({
    genreSlug: r.genreSlug,
    interestLevel: r.interestLevel,
  }));

  const summaries = computeGenreSummaries(entries);

  await db
    .delete(audienceGenreSummaries)
    .where(eq(audienceGenreSummaries.audienceId, audienceId));

  if (summaries.length === 0) return;

  await db.insert(audienceGenreSummaries).values(
    summaries.map((s) => ({
      audienceId,
      genreSlug: s.genreSlug,
      avgInterest: String(s.avgInterest),
      pctHighlyInterested: String(s.pctHighlyInterested),
      respondentCount: s.respondentCount,
    })),
  );
}
