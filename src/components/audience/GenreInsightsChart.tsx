import { InsightsContent } from './InsightsContent';

interface Props {
  audienceId: string | null;
}

export function GenreInsightsChart({ audienceId }: Props) {
  if (!audienceId) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">Select or create an audience to view genre insights.</p>
      </div>
    );
  }

  return <InsightsContent audienceId={audienceId} />;
}
