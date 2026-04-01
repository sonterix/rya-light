import { CreativeOutputCard } from '@/components/creative/creative-output-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreativeOutput } from '@/db/schema';

interface Props {
  outputs: CreativeOutput[];
  isLoading: boolean;
}

export function CreativeOutputList({ outputs, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {outputs.map((output) => (
        <CreativeOutputCard key={output.id} output={output} />
      ))}
    </div>
  );
}
