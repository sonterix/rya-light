import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';
import { creativeOutputs } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';
import type { CreativeContent } from '@/types/creative';
import {
  isCampaignContent,
  isMessagingContent,
  isOpportunityContent,
  isPersonaContent,
} from '@/types/creative';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const patchBodySchema = z.object({
  content: z.record(z.string(), z.unknown()),
});

function isCreativeContent(value: unknown): value is CreativeContent {
  return isPersonaContent(value) || isCampaignContent(value) || isMessagingContent(value) || isOpportunityContent(value);
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

  const [existing] = await db
    .select()
    .from(creativeOutputs)
    .where(eq(creativeOutputs.id, id));

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ data: existing });
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = patchBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(creativeOutputs)
    .where(eq(creativeOutputs.id, id));

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isCreativeContent(parsed.data.content)) {
    return NextResponse.json(
      { error: 'Invalid content structure' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(creativeOutputs)
    .set({ content: parsed.data.content, updatedAt: new Date() })
    .where(and(eq(creativeOutputs.id, id), eq(creativeOutputs.userId, auth.user.id)))
    .returning();

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
    .from(creativeOutputs)
    .where(eq(creativeOutputs.id, id));

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (existing.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db
    .delete(creativeOutputs)
    .where(and(eq(creativeOutputs.id, id), eq(creativeOutputs.userId, auth.user.id)));

  return NextResponse.json({ data: { success: true } });
}
