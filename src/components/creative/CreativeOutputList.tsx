import { CreativeOutputEditCard } from '@/components/creative/creative-output-edit-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreativeOutput } from '@/db/schema';

interface Props {
  outputs: CreativeOutput[];
  isLoading: boolean;
  audienceId: string;
  genres?: string[];
  traits?: string[];
}

export function CreativeOutputList({ outputs, isLoading, audienceId, genres, traits }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (outputs.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No outputs yet. Generate one above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {outputs.map((output) => (
        <CreativeOutputEditCard
          key={output.id}
          output={output}
          audienceId={audienceId}
          genres={genres}
          traits={traits}
        />
      ))}
    </div>
  );
}
