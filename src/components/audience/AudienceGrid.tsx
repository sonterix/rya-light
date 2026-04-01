'use client';

import { toast } from 'sonner';

import { useAudiences, useDeleteAudience } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

import { AudienceCardSkeleton } from './AudienceCardSkeleton';
import { AudienceCardWithCount } from './AudienceCardWithCount';

interface Props {
  onEdit: (id: string) => void;
}

export function AudienceGrid({ onEdit }: Props) {
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
      <div className="flex flex-col gap-3">
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
    <div className="flex flex-col gap-3">
      {audiences.map((audience) => (
        <AudienceCardWithCount
          key={audience.id}
          audienceId={audience.id}
          isActive={selectedAudienceId === audience.id}
          onSelect={setSelectedAudienceId}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
