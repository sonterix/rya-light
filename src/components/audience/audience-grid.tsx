'use client';

import { toast } from 'sonner';

import { useAudiences, useAudienceWithRespondents, useDeleteAudience } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

import { AudienceCard } from './audience-card';
import { AudienceCardSkeleton } from './audience-card-skeleton';

interface AudienceCardWithCountProps {
  audienceId: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function AudienceCardWithCount({ audienceId, isActive, onSelect, onDelete }: AudienceCardWithCountProps) {
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

export function AudienceGrid() {
  const { data: audiences, isLoading } = useAudiences();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);
  const { mutate: deleteAudience } = useDeleteAudience();

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Delete this audience? This will also remove all associated genre summaries and creative outputs.',
    );
    if (!confirmed) return;

    deleteAudience(id, {
      onSuccess: () => {
        toast.success('Audience deleted');
      },
      onError: () => {
        toast.error('Failed to delete audience');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} role="status" aria-label="Loading">
            <AudienceCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!audiences || audiences.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <p className="text-sm">No audiences yet.</p>
        <p className="text-xs">Create an audience to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {audiences.map((audience) => (
        <AudienceCardWithCount
          key={audience.id}
          audienceId={audience.id}
          isActive={selectedAudienceId === audience.id}
          onSelect={setSelectedAudienceId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
