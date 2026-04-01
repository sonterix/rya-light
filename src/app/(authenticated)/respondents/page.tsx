import { RespondentExplorer } from '@/components/respondents/RespondentExplorer';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function RespondentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Respondents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and inspect individual survey respondents. Expand any row to see the full demographic profile and genre interests.
        </p>
      </div>
      <RespondentExplorer page={page} />
    </div>
  );
}
