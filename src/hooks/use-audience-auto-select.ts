'use client';

import { useEffect } from 'react';

import { useAudiences } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

export function useAudienceAutoSelect(): void {
  const { data: audiences } = useAudiences();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);

  const selectionIsStale =
    audiences &&
    audiences.length > 0 &&
    (!selectedAudienceId || !audiences.some((a) => a.id === selectedAudienceId));

  useEffect(() => {
    if (selectionIsStale && audiences && audiences.length > 0) {
      setSelectedAudienceId(audiences[0].id);
    }
  }, [selectionIsStale, audiences, setSelectedAudienceId]);
}
