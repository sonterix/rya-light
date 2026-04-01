'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Audience } from '@/db/schema';
import { useCreateAudience, useRespondentsForPreview } from '@/hooks/use-audiences';
import type { AudienceFilters } from '@/lib/filter-matching';
import { applyFilters } from '@/lib/filter-matching';

import { FilterControls } from './filter-controls';

interface FormProps {
  onCreated: (audience: Audience) => void;
  onClose: () => void;
}

function AudienceCreateForm({ onCreated, onClose }: FormProps) {
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
          <Input
            id="audience-name"
            placeholder="e.g. Wellness-Oriented Parents"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Filters</p>
          <FilterControls filters={filters} onChange={setFilters} />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{matchingCount}</span>{' '}
          matching respondents
        </div>
      </div>

      <SheetFooter className="px-4">
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || isPending}
          className="w-full"
        >
          {isPending ? 'Creating...' : 'Create Audience'}
        </Button>
      </SheetFooter>
    </>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (audience: Audience) => void;
}

export function AudienceCreateSheet({ open, onOpenChange, onCreated }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create Audience</SheetTitle>
        </SheetHeader>
        {open && (
          <AudienceCreateForm
            key={String(open)}
            onCreated={onCreated}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
