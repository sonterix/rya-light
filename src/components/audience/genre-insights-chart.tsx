'use client';

import { useState } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { GenreInsight } from '@/hooks/use-audiences';
import { useAudienceInsights } from '@/hooks/use-audiences';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const TOP_GENRES_COUNT = 5;

interface Props {
  audienceId: string | null;
}

interface ChartEntry {
  name: string;
  pct: number;
  avgInterest: string;
  pctLabel: string;
}

function buildChartEntries(genres: GenreInsight[]): ChartEntry[] {
  return genres.map((g) => ({
    name: g.genreName,
    pct: Math.round(parseFloat(g.pctHighlyInterested) * 100),
    avgInterest: parseFloat(g.avgInterest).toFixed(1),
    pctLabel: `${Math.round(parseFloat(g.pctHighlyInterested) * 100)}%`,
  }));
}

interface GenreChartProps {
  entries: ChartEntry[];
}

function GenreChart({ entries }: GenreChartProps) {
  return (
    <div style={{ width: '100%', height: entries.length * 52 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={entries}
          margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 13 }}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {entries.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
            ))}
            <LabelList
              dataKey="pctLabel"
              position="right"
              style={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GenreLegend({ entries }: { entries: ChartEntry[] }) {
  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      {entries.map((entry) => (
        <li key={entry.name}>
          <span className="font-medium text-foreground">{entry.name}</span>
          {' - '}Avg: {entry.avgInterest}
          {' - '}
          {entry.pctLabel} highly interested
        </li>
      ))}
    </ul>
  );
}

function InsightsContent({ audienceId }: { audienceId: string }) {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useAudienceInsights(audienceId);

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
    return (
      <p className="text-sm text-muted-foreground">
        No genre insights available yet. Genre data will appear once the audience is processed.
      </p>
    );
  }

  const visibleGenres = showAll ? data : data.slice(0, TOP_GENRES_COUNT);
  const hasMore = data.length > TOP_GENRES_COUNT;
  const chartEntries = buildChartEntries(visibleGenres);

  return (
    <div className="space-y-4">
      <GenreChart entries={chartEntries} />
      <GenreLegend entries={chartEntries} />
      {hasMore && !showAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(true)}
        >
          Show more
        </Button>
      )}
    </div>
  );
}

export function GenreInsightsChart({ audienceId }: Props) {
  if (!audienceId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Select or create an audience to view genre insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Genre Insights</h2>
      <InsightsContent audienceId={audienceId} />
    </div>
  );
}
