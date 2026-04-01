import type { GenreInsight } from '@/hooks/use-audiences';

export interface ChartEntry {
  name: string;
  pct: number;
  pctLabel: string;
}

export interface TableRow {
  genreName: string;
  pctHighlyInterested: number;
  avgInterest: string;
}

export function shortenGenreName(name: string): string {
  return name.replace(' / ', ' / \n').length > 25 ? name.replace(/\s*\/\s*/g, ' / ').slice(0, 25) + '...' : name;
}

export function toChartEntry(genre: GenreInsight): ChartEntry {
  const pct = Math.round(parseFloat(genre.pctHighlyInterested) * 100);
  return {
    name: shortenGenreName(genre.genreName),
    pct,
    pctLabel: `${pct}%`,
  };
}

export function toTableRow(genre: GenreInsight): TableRow {
  return {
    genreName: genre.genreName,
    pctHighlyInterested: Math.round(parseFloat(genre.pctHighlyInterested) * 100),
    avgInterest: parseFloat(genre.avgInterest).toFixed(1),
  };
}

export function sortByPctDesc(genres: GenreInsight[]): GenreInsight[] {
  return [...genres].sort((a, b) => parseFloat(b.pctHighlyInterested) - parseFloat(a.pctHighlyInterested));
}
