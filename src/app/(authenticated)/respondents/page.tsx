import { RespondentExplorer } from '@/components/respondents/respondent-explorer';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function RespondentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Respondents</h1>
      <RespondentExplorer page={page} />
    </div>
  );
}
