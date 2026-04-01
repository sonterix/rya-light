import { Tv } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CampaignConceptSchema, CampaignSchema } from '@/lib/schemas/campaign-schema';

interface Props {
  campaign: Partial<CampaignSchema> | null;
  isGenerating?: boolean;
}

function ConceptCard({ concept }: { concept: Partial<CampaignConceptSchema> }) {
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

export function CampaignConceptsCard({ campaign, isGenerating = false }: Props) {
  if (!campaign && isGenerating) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const concepts = campaign.concepts ?? [];

  if (concepts.length === 0 && isGenerating) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {concepts.map((concept, i) => (
        <ConceptCard key={concept.name ?? i} concept={concept} />
      ))}
    </div>
  );
}
