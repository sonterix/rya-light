import { Tv } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CampaignConceptSchema } from '@/lib/schemas/campaign-schema';

interface Props {
  concept: Partial<CampaignConceptSchema>;
}

export function ConceptCard({ concept }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        {concept.name ? (
          <CardTitle className="text-base">{concept.name}</CardTitle>
        ) : (
          <Skeleton className="h-5 w-40" />
        )}

        {concept.tagline ? (
          <p className="text-muted-foreground text-sm italic">{concept.tagline}</p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {concept.description ? (
          <p className="text-sm leading-relaxed">{concept.description}</p>
        ) : null}

        {concept.targetGenres !== undefined && concept.targetGenres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {concept.targetGenres.map((genre) => (
              <span
                key={genre}
                className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {concept.suggestedFormat ? (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Tv className="h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-medium">Format:</span> {concept.suggestedFormat}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
