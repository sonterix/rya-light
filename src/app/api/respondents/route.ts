import { count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { respondents } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

const PAGE_SIZE = 10;

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export async function GET(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({ page: searchParams.get('page') ?? 1 });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { page } = parsed.data;
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        respondentId: respondents.respondentId,
        audienceCategory: respondents.audienceCategory,
        age: respondents.age,
        gender: respondents.gender,
        region: respondents.region,
        state: respondents.state,
        householdIncomeUsd: respondents.householdIncomeUsd,
      })
      .from(respondents)
      .orderBy(respondents.respondentId)
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(respondents),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return NextResponse.json({
    data: {
      respondents: rows,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages,
      },
    },
  });
}
