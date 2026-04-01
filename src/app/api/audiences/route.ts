import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { audiences } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

const filterValueSchema = z.union([
  z.array(z.string()),
  z.object({ min: z.number().optional(), max: z.number().optional() }),
]);

const createAudienceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  filters: z.record(z.string(), filterValueSchema).optional().nullable(),
  manualIncludes: z.array(z.number().int()).optional().default([]),
  manualExcludes: z.array(z.number().int()).optional().default([]),
});

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userAudiences = await db
    .select()
    .from(audiences)
    .where(eq(audiences.userId, auth.user.id))
    .orderBy(desc(audiences.updatedAt));

  return NextResponse.json({ data: userAudiences });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = createAudienceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { name, filters, manualIncludes, manualExcludes } = parsed.data;

  const [created] = await db
    .insert(audiences)
    .values({
      userId: auth.user.id,
      name,
      filters: filters ?? null,
      manualIncludes: manualIncludes ?? [],
      manualExcludes: manualExcludes ?? [],
    })
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}
