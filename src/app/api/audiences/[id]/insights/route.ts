import { asc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { audienceGenreSummaries, audiences, genres } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [audience] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.id, id));

  if (!audience) {
    return NextResponse.json({ error: 'Audience not found' }, { status: 404 });
  }

  if (audience.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const summaries = await db
    .select({
      genreSlug: audienceGenreSummaries.genreSlug,
      genreName: genres.genreName,
      avgInterest: audienceGenreSummaries.avgInterest,
      pctHighlyInterested: audienceGenreSummaries.pctHighlyInterested,
      respondentCount: audienceGenreSummaries.respondentCount,
    })
    .from(audienceGenreSummaries)
    .innerJoin(genres, eq(audienceGenreSummaries.genreSlug, genres.genreSlug))
    .where(eq(audienceGenreSummaries.audienceId, id))
    .orderBy(asc(audienceGenreSummaries.avgInterest));

  return NextResponse.json({ data: summaries });
}
