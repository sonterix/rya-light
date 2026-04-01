import type { TableRow } from './genre-insights-utils';

interface Props {
  rows: TableRow[];
}

export function GenreTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-muted-foreground px-3 py-2 text-left font-medium">Genre</th>
            <th className="text-muted-foreground px-3 py-2 text-right font-medium">% Highly Interested</th>
            <th className="text-muted-foreground px-3 py-2 text-right font-medium">Avg Interest Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.genreName} className="border-b last:border-b-0">
              <td className="px-3 py-2 font-medium">{row.genreName}</td>
              <td className="text-muted-foreground px-3 py-2 text-right">{row.pctHighlyInterested}%</td>
              <td className="text-muted-foreground px-3 py-2 text-right">{row.avgInterest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
