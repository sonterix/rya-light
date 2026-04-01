'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetFooter } from '@/components/ui/sheet';
import type { Audience } from '@/db/schema';
import { useCreateAudience, useRespondentsForPreview } from '@/hooks/use-audiences';
import type { AudienceFilters } from '@/lib/filter-matching';
import { applyFilters } from '@/lib/filter-matching';

import { FilterControls } from './FilterControls';

interface Props {
  onCreated: (audience: Audience) => void;
  onClose: () => void;
}

export function AudienceCreateForm({ onCreated, onClose }: Props) {
  const [name, setName] = useState('');
  const [filters, setFilters] = useState<AudienceFilters>({});

  const { mutate, isPending } = useCreateAudience();
  const { data: allRespondents = [] } = useRespondentsForPreview();

  const matchingCount = applyFilters({
    filters,
    manualIncludes: null,
    manualExcludes: null,
    respondents: allRespondents,
  }).length;

  function handleSubmit() {
    if (!name.trim()) return;

    mutate(
      {
        name: name.trim(),
        filters: Object.keys(filters).length > 0 ? filters : null,
        manualIncludes: [],
        manualExcludes: [],
      },
      {
        onSuccess: (created) => {
          onCreated(created);
          onClose();
        },
      },
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audience-name">Audience Name</Label>
          <Input id="audience-name" placeholder="e.g. Wellness-Oriented Parents" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Filters</p>
          <FilterControls filters={filters} onChange={setFilters} />
        </div>

        <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-3 text-sm">
          <span className="text-foreground font-medium">{matchingCount}</span> matching respondents
        </div>
      </div>

      <SheetFooter className="px-4">
        <Button onClick={handleSubmit} disabled={!name.trim() || isPending} className="w-full">
          {isPending ? 'Creating...' : 'Create Audience'}
        </Button>
      </SheetFooter>
    </>
  );
}
