'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { AudienceCreateSheet } from '@/components/audience/audience-create-sheet';
import { AudienceGrid } from '@/components/audience/audience-grid';
import { Button } from '@/components/ui/button';
import type { Audience } from '@/db/schema';
import { useAudienceStore } from '@/stores/audience-store';

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);

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

      <AudienceGrid />

      <AudienceCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleAudienceCreated}
      />
    </div>
  );
}
