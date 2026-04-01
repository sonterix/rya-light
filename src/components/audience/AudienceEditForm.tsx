'use client';

import { useAudienceWithRespondents } from '@/hooks/use-audiences';
import type { AudienceFilters } from '@/lib/filter-matching';

import { AudienceEditFormInner } from './AudienceEditFormInner';

function isAudienceFilters(value: unknown): value is AudienceFilters {
  return value !== null && typeof value === 'object';
}

interface Props {
  audienceId: string;
}

export function AudienceEditForm({ audienceId }: Props) {
  const { data } = useAudienceWithRespondents(audienceId);

  if (!data) {
    return null;
  }

  const filters = isAudienceFilters(data.audience.filters) ? data.audience.filters : {};

  return (
    <AudienceEditFormInner
      key={audienceId}
      audienceId={audienceId}
      initialName={data.audience.name}
      initialFilters={filters}
      initialManualIncludes={data.audience.manualIncludes ?? []}
      initialManualExcludes={data.audience.manualExcludes ?? []}
    />
  );
}
