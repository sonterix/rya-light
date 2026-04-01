'use client';

import { RespondentPagination } from '@/components/respondents/respondent-pagination';
import { RespondentTable } from '@/components/respondents/respondent-table';
import { RespondentTableSkeleton } from '@/components/respondents/respondent-table-skeleton';
import { useRespondents } from '@/hooks/use-respondents';

interface Props {
  page: number;
}

export function RespondentExplorer({ page }: Props) {
  const { data, isLoading, isError } = useRespondents(page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <RespondentTableSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md border border-border px-4 py-12 text-center text-sm text-destructive">
        Failed to load respondents. Please try again.
      </div>
    );
  }

  const { respondents, pagination } = data.data;

  return (
    <div className="space-y-4">
      <RespondentTable respondents={respondents} />
      <RespondentPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
