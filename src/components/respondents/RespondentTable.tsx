'use client';

import { useState } from 'react';

import { RespondentTableRow } from '@/components/respondents/RespondentTableRow';
import type { RespondentSummary } from '@/types/respondent';

interface Props {
  respondents: RespondentSummary[];
}

const COLUMNS = ['ID', 'Audience Category', 'Age', 'Gender', 'Location', 'Household Income', ''];

export function RespondentTable({ respondents }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function handleToggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (respondents.length === 0) {
    return (
      <div className="rounded-md border border-border px-4 py-12 text-center text-sm text-muted-foreground">
        No respondents found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {COLUMNS.map((col, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {respondents.map((respondent) => (
            <RespondentTableRow
              key={respondent.respondentId}
              respondent={respondent}
              isExpanded={expandedId === respondent.respondentId}
              onToggle={() => handleToggle(respondent.respondentId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
