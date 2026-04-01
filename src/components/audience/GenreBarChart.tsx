import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { ChartEntry } from './genre-insights-utils';
import { GenreAxisTick } from './GenreAxisTick';

function barOpacity(pct: number): number {
  if (pct >= 88) return 1;
  if (pct >= 52) return 0.85;
  if (pct >= 32) return 0.7;
  if (pct >= 24) return 0.55;
  return 0.45;
}

interface Props {
  entries: ChartEntry[];
}

export function GenreBarChart({ entries }: Props) {
  const visibleEntries = entries.filter((entry) => entry.pct > 0);

  if (visibleEntries.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">No genres with high interest ratings for this audience.</p>;
  }

  return (
    <div style={{ width: '100%', height: visibleEntries.length * 48 + 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={visibleEntries} margin={{ top: 4, right: 48, left: 0, bottom: 4 }} barCategoryGap="20%">
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={180} tick={GenreAxisTick} axisLine={false} tickLine={false} interval={0} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={20}>
            {visibleEntries.map((entry) => (
              <Cell key={entry.name} fill="var(--primary)" fillOpacity={barOpacity(entry.pct)} />
            ))}
            <LabelList dataKey="pctLabel" position="right" style={{ fontSize: 12, fontWeight: 500 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
