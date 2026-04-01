'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import { RespondentDetailPanel } from '@/components/respondents/RespondentDetailPanel';
import type { RespondentSummary } from '@/types/respondent';

interface Props {
  respondent: RespondentSummary;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RespondentTableRow({ respondent, isExpanded, onToggle }: Props) {
  return (
    <>
      <tr
        className={`cursor-pointer border-b border-border transition-colors hover:bg-muted/50 ${isExpanded ? 'bg-muted/50' : ''}`}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <td className="px-4 py-3 text-sm">{respondent.respondentId}</td>
        <td className="px-4 py-3 text-sm">{respondent.audienceCategory}</td>
        <td className="px-4 py-3 text-sm">{respondent.age}</td>
        <td className="px-4 py-3 text-sm">{respondent.gender}</td>
        <td className="px-4 py-3 text-sm">
          {respondent.region}, {respondent.state}
        </td>
        <td className="px-4 py-3 text-sm">{formatCurrency(respondent.householdIncomeUsd)}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <RespondentDetailPanel respondentId={respondent.respondentId} />
          </td>
        </tr>
      )}
    </>
  );
}
