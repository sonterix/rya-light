'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAudienceWithRespondents, useRespondentsForPreview, useUpdateAudience } from '@/hooks/use-audiences';
import type { AudienceFilters } from '@/lib/filter-matching';
import { applyFilters } from '@/lib/filter-matching';

import { FilterControls } from './filter-controls';
import { ManualOverridesPanel } from './manual-overrides-panel';

const DEBOUNCE_MS = 800;

interface EditFormInnerProps {
  audienceId: string;
  initialName: string;
  initialFilters: AudienceFilters;
  initialManualIncludes: number[];
  initialManualExcludes: number[];
}

function AudienceEditFormInner({
  audienceId,
  initialName,
  initialFilters,
  initialManualIncludes,
  initialManualExcludes,
}: EditFormInnerProps) {
  const { mutate: updateAudience } = useUpdateAudience();
  const { data: allRespondents = [] } = useRespondentsForPreview();

  const [name, setName] = useState(initialName);
  const [filters, setFilters] = useState<AudienceFilters>(initialFilters);
  const [manualIncludes, setManualIncludes] = useState<number[]>(initialManualIncludes);
  const [manualExcludes, setManualExcludes] = useState<number[]>(initialManualExcludes);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matchingRespondents = applyFilters({
    filters,
    manualIncludes,
    manualExcludes,
    respondents: allRespondents,
  });

  const matchingCount = matchingRespondents.length;

  function scheduleSave(
    updatedName: string,
    updatedFilters: AudienceFilters,
    updatedIncludes: number[],
    updatedExcludes: number[],
  ) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (!updatedName.trim()) return;
      updateAudience(
        {
          id: audienceId,
          name: updatedName.trim(),
          filters: Object.keys(updatedFilters).length > 0 ? updatedFilters : null,
          manualIncludes: updatedIncludes,
          manualExcludes: updatedExcludes,
        },
        {
          onError: () => {
            toast.error('Failed to save changes');
          },
        },
      );
    }, DEBOUNCE_MS);
  }

  function handleNameChange(value: string) {
    setName(value);
    scheduleSave(value, filters, manualIncludes, manualExcludes);
  }

  function handleFiltersChange(updatedFilters: AudienceFilters) {
    setFilters(updatedFilters);
    scheduleSave(name, updatedFilters, manualIncludes, manualExcludes);
  }

  function handleManualIncludesChange(updatedIncludes: number[]) {
    setManualIncludes(updatedIncludes);
    scheduleSave(name, filters, updatedIncludes, manualExcludes);
  }

  function handleManualExcludesChange(updatedExcludes: number[]) {
    setManualExcludes(updatedExcludes);
    scheduleSave(name, filters, manualIncludes, updatedExcludes);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-audience-name">Audience Name</Label>
        <Input
          id="edit-audience-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Filters</p>
        <FilterControls filters={filters} onChange={handleFiltersChange} />
      </div>

      <div
        className={`rounded-lg border p-3 text-sm ${
          matchingCount === 0
            ? 'border-destructive/50 bg-destructive/10 text-destructive'
            : 'border-border bg-muted/30 text-muted-foreground'
        }`}
      >
        {matchingCount === 0 ? (
          <span>No respondents match the current filters. Adjust your criteria to include respondents.</span>
        ) : (
          <>
            <span className="font-medium text-foreground">{matchingCount}</span>{' '}
            matching respondents
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Matching Respondents</p>
        <ManualOverridesPanel
          matchingRespondents={matchingRespondents}
          allRespondents={allRespondents}
          manualIncludes={manualIncludes}
          manualExcludes={manualExcludes}
          onManualIncludesChange={handleManualIncludesChange}
          onManualExcludesChange={handleManualExcludesChange}
        />
      </div>
    </div>
  );
}

interface EditFormProps {
  audienceId: string;
}

function AudienceEditForm({ audienceId }: EditFormProps) {
  const { data } = useAudienceWithRespondents(audienceId);

  if (!data) {
    return null;
  }

  return (
    <AudienceEditFormInner
      key={audienceId}
      audienceId={audienceId}
      initialName={data.audience.name}
      initialFilters={(data.audience.filters as AudienceFilters) ?? {}}
      initialManualIncludes={data.audience.manualIncludes ?? []}
      initialManualExcludes={data.audience.manualExcludes ?? []}
    />
  );
}

interface EditSheetProps {
  audienceId: string | null;
  onClose: () => void;
}

export function AudienceEditSheet({ audienceId, onClose }: EditSheetProps) {
  return (
    <Sheet open={audienceId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Audience</SheetTitle>
        </SheetHeader>
        {audienceId && (
          <AudienceEditForm
            key={audienceId}
            audienceId={audienceId}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
