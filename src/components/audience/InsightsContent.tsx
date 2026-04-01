'use client';

import { useMemo } from 'react';

import { useAudienceInsights } from '@/hooks/use-audiences';

import { Skeleton } from '../ui/skeleton';

import { sortByPctDesc, toChartEntry, toTableRow } from './genre-insights-utils';
import { GenreBarChart } from './GenreBarChart';
import { GenreTable } from './GenreTable';

const TOP_CHART_COUNT = 10;

interface Props {
  audienceId: string;
}

export function InsightsContent({ audienceId }: Props) {
  const { data, isLoading } = useAudienceInsights(audienceId);

  const sorted = useMemo(() => (data ? sortByPctDesc(data) : []), [data]);

  const chartEntries = useMemo(() => sorted.slice(0, TOP_CHART_COUNT).map(toChartEntry), [sorted]);

  const tableRows = useMemo(() => sorted.map(toTableRow), [sorted]);

  if (isLoading) {
    return (
      <div aria-label="Loading genre insights" role="status" className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-sm">No genre insights available yet. Genre data will appear once the audience is processed.</p>;
  }

  return (
    <div className="space-y-6">
      <GenreBarChart entries={chartEntries} />
      <GenreTable rows={tableRows} />
    </div>
  );
}
