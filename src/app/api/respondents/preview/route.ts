import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { respondents } from '@/db/schema';
import { getAuthUser } from '@/lib/supabase/auth';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      respondentId: respondents.respondentId,
      wave: respondents.wave,
      waveId: respondents.waveId,
      weight: respondents.weight,
      audienceCategory: respondents.audienceCategory,
      age: respondents.age,
      gender: respondents.gender,
      ethnicity: respondents.ethnicity,
      region: respondents.region,
      communityType: respondents.communityType,
      maritalStatus: respondents.maritalStatus,
      householdSize: respondents.householdSize,
      education: respondents.education,
      employmentStatus: respondents.employmentStatus,
      householdIncomeUsd: respondents.householdIncomeUsd,
      investableAssetsUsd: respondents.investableAssetsUsd,
      zipCode: respondents.zipCode,
      state: respondents.state,
      dma: respondents.dma,
      parentStatus: respondents.parentStatus,
      politicalAffiliation: respondents.politicalAffiliation,
      homeOwnership: respondents.homeOwnership,
    })
    .from(respondents)
    .orderBy(respondents.respondentId);

  return NextResponse.json({ data: rows });
}
