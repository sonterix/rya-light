import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { genres, respondentGenreInterests, respondents } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawParams = await context.params;
  const parsed = paramsSchema.safeParse({ id: rawParams.id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { id } = parsed.data;

  const [respondentRows, interestRows] = await Promise.all([
    db
      .select()
      .from(respondents)
      .where(eq(respondents.respondentId, id))
      .limit(1),
    db
      .select({
        genreSlug: respondentGenreInterests.genreSlug,
        genreName: genres.genreName,
        interestLevel: respondentGenreInterests.interestLevel,
      })
      .from(respondentGenreInterests)
      .innerJoin(genres, eq(respondentGenreInterests.genreSlug, genres.genreSlug))
      .where(eq(respondentGenreInterests.respondentId, id)),
  ]);

  if (respondentRows.length === 0) {
    return NextResponse.json({ error: 'Respondent not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      respondent: respondentRows[0],
      genreInterests: interestRows,
    },
  });
}
