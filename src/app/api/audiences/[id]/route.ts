import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/db';
import { audiences, respondents } from '@/db/schema';
import { applyFilters } from '@/lib/filter-matching';
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

  const allRespondents = await db.select().from(respondents);

  const matchingRespondents = applyFilters({
    filters: audience.filters,
    manualIncludes: audience.manualIncludes,
    manualExcludes: audience.manualExcludes,
    respondents: allRespondents,
  });

  return NextResponse.json({
    data: {
      audience,
      respondents: matchingRespondents,
    },
  });
}
