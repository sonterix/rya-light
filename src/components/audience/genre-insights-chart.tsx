'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { GenreInsight } from '@/hooks/use-audiences';
import { useAudienceInsights } from '@/hooks/use-audiences';

import { Skeleton } from '../ui/skeleton';

const TOP_CHART_COUNT = 10;

interface Props {
  audienceId: string | null;
}

interface ChartEntry {
  name: string;
  pct: number;
  pctLabel: string;
}

interface TableRow {
  genreName: string;
  pctHighlyInterested: number;
  avgInterest: string;
}

function toChartEntry(genre: GenreInsight): ChartEntry {
  const pct = Math.round(parseFloat(genre.pctHighlyInterested) * 100);
  return {
    name: genre.genreName,
    pct,
    pctLabel: `${pct}%`,
  };
}

function toTableRow(genre: GenreInsight): TableRow {
  return {
    genreName: genre.genreName,
    pctHighlyInterested: Math.round(parseFloat(genre.pctHighlyInterested) * 100),
    avgInterest: parseFloat(genre.avgInterest).toFixed(1),
  };
}

function sortByPctDesc(genres: GenreInsight[]): GenreInsight[] {
  return [...genres].sort(
    (a, b) => parseFloat(b.pctHighlyInterested) - parseFloat(a.pctHighlyInterested),
  );
}

interface GenreBarChartProps {
  entries: ChartEntry[];
}

function GenreBarChart({ entries }: GenreBarChartProps) {
  return (
    <div style={{ width: '100%', height: entries.length * 40 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={entries}
          margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
          barCategoryGap="20%"
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={20}>
            {entries.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-1))" />
            ))}
            <LabelList
              dataKey="pctLabel"
              position="right"
              style={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface GenreTableProps {
  rows: TableRow[];
}

function GenreTable({ rows }: GenreTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Genre</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              % Highly Interested
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Avg Interest Score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.genreName} className="border-b last:border-b-0">
              <td className="px-3 py-2 font-medium">{row.genreName}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">
                {row.pctHighlyInterested}%
              </td>
              <td className="px-3 py-2 text-right text-muted-foreground">{row.avgInterest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsightsContent({ audienceId }: { audienceId: string }) {
  const { data, isLoading } = useAudienceInsights(audienceId);

  const sorted = useMemo(() => (data ? sortByPctDesc(data) : []), [data]);

  const chartEntries = useMemo(
    () => sorted.slice(0, TOP_CHART_COUNT).map(toChartEntry),
    [sorted],
  );

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
    return (
      <p className="text-sm text-muted-foreground">
        No genre insights available yet. Genre data will appear once the audience is processed.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <GenreBarChart entries={chartEntries} />
      <GenreTable rows={tableRows} />
    </div>
  );
}

export function GenreInsightsChart({ audienceId }: Props) {
  if (!audienceId) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
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
