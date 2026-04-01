'use client';

import { Plus, UserMinus, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Respondent } from '@/db/schema';

interface Props {
  matchingRespondents: Respondent[];
  allRespondents: Respondent[];
  manualIncludes: number[];
  manualExcludes: number[];
  onManualIncludesChange: (ids: number[]) => void;
  onManualExcludesChange: (ids: number[]) => void;
}

export function ManualOverridesPanel({
  matchingRespondents,
  allRespondents,
  manualIncludes,
  manualExcludes,
  onManualIncludesChange,
  onManualExcludesChange,
}: Props) {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showExcludedPanel, setShowExcludedPanel] = useState(false);

  const manualIncludesSet = useMemo(() => new Set(manualIncludes), [manualIncludes]);
  const matchingIds = useMemo(
    () => new Set(matchingRespondents.map((r) => r.respondentId)),
    [matchingRespondents],
  );

  const excludedRespondents = useMemo(
    () => allRespondents.filter((r) => manualExcludes.includes(r.respondentId)),
    [allRespondents, manualExcludes],
  );

  const addableRespondents = useMemo(
    () => allRespondents.filter((r) => !matchingIds.has(r.respondentId)),
    [allRespondents, matchingIds],
  );

  function handleExclude(respondentId: number) {
    onManualExcludesChange([...manualExcludes, respondentId]);
  }

  function handleReInclude(respondentId: number) {
    const updated = manualExcludes.filter((id) => id !== respondentId);
    onManualExcludesChange(updated);
    if (updated.length === 0) {
      setShowExcludedPanel(false);
    }
  }

  function handleAddRespondent(respondentId: number) {
    if (!manualIncludesSet.has(respondentId)) {
      onManualIncludesChange([...manualIncludes, respondentId]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {matchingRespondents.map((respondent) => {
          const isManuallyAdded = manualIncludesSet.has(respondent.respondentId);
          return (
            <div
              key={respondent.respondentId}
              className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Respondent #{respondent.respondentId}
                </span>
                {isManuallyAdded && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Manually added
                  </span>
                )}
              </div>
              {!isManuallyAdded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleExclude(respondent.respondentId)}
                >
                  <UserMinus className="size-3.5" />
                  Exclude
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {manualExcludes.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-fit text-xs"
          onClick={() => setShowExcludedPanel((prev) => !prev)}
        >
          {manualExcludes.length} excluded
        </Button>
      )}

      {showExcludedPanel && manualExcludes.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <p className="text-sm font-medium">Excluded Respondents</p>
          {excludedRespondents.map((respondent) => (
            <div
              key={respondent.respondentId}
              className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
            >
              <span className="text-sm">Respondent #{respondent.respondentId}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => handleReInclude(respondent.respondentId)}
              >
                <UserPlus className="size-3.5" />
                Re-include
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-fit gap-1.5 text-xs"
        onClick={() => setShowAddPanel((prev) => !prev)}
      >
        <Plus className="size-3.5" />
        Add respondent
      </Button>

      {showAddPanel && (
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          {addableRespondents.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              All respondents are already in the matching list.
            </p>
          ) : (
            addableRespondents.map((respondent) => (
              <div
                key={respondent.respondentId}
                className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
              >
                <span className="text-sm">Respondent #{respondent.respondentId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => handleAddRespondent(respondent.respondentId)}
                >
                  <UserPlus className="size-3.5" />
                  Add #{respondent.respondentId}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
