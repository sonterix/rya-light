import { eq } from 'drizzle-orm';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { audiences, respondents } from '@/db/schema';
import { computeAndSaveAudienceInsights } from '@/lib/compute-audience-insights';
import { applyFilters } from '@/lib/filter-matching';
import { getAuthUser } from '@/lib/supabase/auth';

const filterValueSchema = z.union([
  z.array(z.string()),
  z.object({ min: z.number().optional(), max: z.number().optional() }),
]);

const updateAudienceSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  filters: z.record(z.string(), filterValueSchema).optional().nullable(),
  manualIncludes: z.array(z.number().int()).optional().nullable(),
  manualExcludes: z.array(z.number().int()).optional().nullable(),
});

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

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.id, id));

  if (!existing) {
    return NextResponse.json({ error: 'Audience not found' }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body: unknown = await req.json();
  const parsed = updateAudienceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const updates: Partial<typeof existing> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if ('filters' in parsed.data) updates.filters = parsed.data.filters ?? null;
  if ('manualIncludes' in parsed.data) updates.manualIncludes = parsed.data.manualIncludes ?? null;
  if ('manualExcludes' in parsed.data) updates.manualExcludes = parsed.data.manualExcludes ?? null;

  const [updated] = await db
    .update(audiences)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(audiences.id, id))
    .returning();

  const allRespondents = await db.select().from(respondents);
  const matchingRespondents = applyFilters({
    filters: updated.filters,
    manualIncludes: updated.manualIncludes,
    manualExcludes: updated.manualExcludes,
    respondents: allRespondents,
  });
  const respondentIds = matchingRespondents.map((r) => r.respondentId);
  await computeAndSaveAudienceInsights(id, respondentIds);

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(audiences)
    .where(eq(audiences.id, id));

  if (!existing) {
    return NextResponse.json({ error: 'Audience not found' }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.delete(audiences).where(eq(audiences.id, id));

  return NextResponse.json({ data: { success: true } });
}
