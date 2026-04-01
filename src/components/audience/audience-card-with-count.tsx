'use client';

import { useAudienceWithRespondents } from '@/hooks/use-audiences';

import { AudienceCard } from './audience-card';
import { AudienceCardSkeleton } from './audience-card-skeleton';

interface Props {
  audienceId: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AudienceCardWithCount({ audienceId, isActive, onSelect, onDelete }: Props) {
  const { data, isLoading } = useAudienceWithRespondents(audienceId);
  const audience = data?.audience;
  const respondentCount = data?.respondents.length ?? 0;

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
      isActive={isActive}
      onSelect={onSelect}
      onDelete={onDelete}
    />
  );
}
