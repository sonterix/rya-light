'use client';

import { useState } from 'react';

import { RespondentTableRow } from '@/components/respondents/respondent-table-row';
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
    <div className="rounded-md border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {COLUMNS.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
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
