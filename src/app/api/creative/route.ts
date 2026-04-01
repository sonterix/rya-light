import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { creativeOutputs } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

const workflowTypeSchema = z.enum(['persona', 'campaign', 'messaging', 'opportunity']);

const querySchema = z.object({
  audience_id: z.string().uuid().optional(),
  type: workflowTypeSchema.optional(),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    audience_id: searchParams.get('audience_id') ?? undefined,
    type: searchParams.get('type') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query params' },
      { status: 400 },
    );
  }

  const { audience_id, type } = parsed.data;

  const conditions = [eq(creativeOutputs.userId, auth.user.id)];

  if (audience_id) {
    conditions.push(eq(creativeOutputs.audienceId, audience_id));
  }

  if (type) {
    conditions.push(eq(creativeOutputs.type, type));
  }

  const outputs = await db
    .select()
    .from(creativeOutputs)
    .where(and(...conditions))
    .orderBy(desc(creativeOutputs.createdAt));

  return NextResponse.json({ data: outputs });
}
