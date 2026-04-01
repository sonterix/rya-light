import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getAuthUser } from '@/lib/supabase/auth';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const configured = Boolean(process.env.OPENAI_API_KEY);

  return NextResponse.json({ data: { configured } });
}
