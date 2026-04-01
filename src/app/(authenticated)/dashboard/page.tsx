'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { AudienceCreateSheet } from '@/components/audience/audience-create-sheet';
import { AudienceEditSheet } from '@/components/audience/audience-edit-sheet';
import { AudienceGrid } from '@/components/audience/audience-grid';
import { GenreInsightsChart } from '@/components/audience/genre-insights-chart';
import { Button } from '@/components/ui/button';
import type { Audience } from '@/db/schema';
import { useAudienceStore } from '@/stores/audience-store';

export default function DashboardPage() {
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);

  function handleAudienceCreated(audience: Audience) {
    setSelectedAudienceId(audience.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Audiences</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Create Audience
        </Button>
      </div>

      <AudienceGrid onEdit={setEditingAudienceId} />

      <GenreInsightsChart audienceId={selectedAudienceId} />

      <AudienceCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleAudienceCreated}
      />

      <AudienceEditSheet
        audienceId={editingAudienceId}
        onClose={() => setEditingAudienceId(null)}
      />
    </div>
  );
}
