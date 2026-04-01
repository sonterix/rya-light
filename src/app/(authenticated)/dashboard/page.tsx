'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { AudienceCreateSheet } from '@/components/audience/AudienceCreateSheet';
import { AudienceEditSheet } from '@/components/audience/AudienceEditSheet';
import { AudienceGrid } from '@/components/audience/AudienceGrid';
import { GenreInsightsChart } from '@/components/audience/GenreInsightsChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audience } from '@/db/schema';
import { useAudiences } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

export default function DashboardPage() {
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);
  const { data: audiences } = useAudiences();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);

  const selectedAudience = audiences?.find((a) => a.id === selectedAudienceId);

  function handleAudienceCreated(audience: Audience) {
    setSelectedAudienceId(audience.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Create Audience
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(280px,320px)_1fr]">
        <div className="flex flex-col gap-3">
          <AudienceGrid onEdit={setEditingAudienceId} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Genre Insights</CardTitle>
            {selectedAudience && (
              <p className="text-sm text-muted-foreground">
                Top content interests for {selectedAudience.name}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <GenreInsightsChart audienceId={selectedAudienceId} />
          </CardContent>
        </Card>
      </div>

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
