'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

import { useAudiences, useDeleteAudience } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

import { AudienceCardSkeleton } from './audience-card-skeleton';
import { AudienceCardWithCount } from './audience-card-with-count';

export function AudienceGrid() {
  const { data: audiences, isLoading } = useAudiences();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);
  const { mutate: deleteAudience } = useDeleteAudience();

  const selectionIsStale =
    audiences &&
    audiences.length > 0 &&
    (!selectedAudienceId || !audiences.some((a) => a.id === selectedAudienceId));

  // Sync Zustand store when the selected audience no longer exists in React Query data
  useEffect(() => {
    if (selectionIsStale && audiences && audiences.length > 0) {
      setSelectedAudienceId(audiences[0].id);
    }
  }, [selectionIsStale, audiences, setSelectedAudienceId]);

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
