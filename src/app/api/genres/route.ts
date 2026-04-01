import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { genres } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allGenres = await db.select().from(genres);

  return NextResponse.json({ data: allGenres });
}
