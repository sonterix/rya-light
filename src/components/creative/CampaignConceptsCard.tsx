import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CampaignSchema } from '@/lib/schemas/campaign-schema';

import { ConceptCard } from './ConceptCard';

interface Props {
  campaign: Partial<CampaignSchema> | null;
  isGenerating?: boolean;
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
