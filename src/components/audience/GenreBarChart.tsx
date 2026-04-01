import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import type { ChartEntry } from './genre-insights-utils';

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
        <BarChart layout="vertical" data={visibleEntries} margin={{ top: 4, right: 56, left: 8, bottom: 4 }} barCategoryGap="20%">
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={22} fill="var(--primary)">
            <LabelList dataKey="pctLabel" position="right" style={{ fontSize: 12, fontWeight: 500 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
