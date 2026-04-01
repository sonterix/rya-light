'use client';

import { useAudienceWithRespondents } from '@/hooks/use-audiences';

import { AudienceCard } from './audience-card';
import { AudienceCardSkeleton } from './audience-card-skeleton';

interface Props {
  audienceId: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AudienceCardWithCount({ audienceId, isActive, onSelect, onEdit, onDelete }: Props) {
  const { data, isLoading } = useAudienceWithRespondents(audienceId);
  const audience = data?.audience;
  const respondentCount = data?.respondents.length ?? 0;
  const filterCount =
    audience?.filters !== null &&
    audience?.filters !== undefined &&
    typeof audience.filters === 'object' &&
    !Array.isArray(audience.filters)
      ? Object.keys(audience.filters).length
      : 0;

  if (isLoading || !audience) {
    return (
      <div role="status" aria-label="Loading audience">
        <AudienceCardSkeleton />
      </div>
    );
  }

  return (
    <AudienceCard
      audience={audience}
      respondentCount={respondentCount}
      filterCount={filterCount}
      isActive={isActive}
      onSelect={onSelect}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
