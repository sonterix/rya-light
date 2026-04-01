import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { OpportunitySchema } from '@/lib/schemas/opportunity-schema';

import { OpportunityItemCard } from './OpportunityItemCard';

interface Props {
  opportunity: Partial<OpportunitySchema> | null;
  isGenerating?: boolean;
}

export function OpportunityCard({ opportunity, isGenerating = false }: Props) {
  if (!opportunity && isGenerating) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-14" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  const items = opportunity.opportunities ?? [];

  if (items.length === 0 && isGenerating) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <OpportunityItemCard key={item.gapGenre ?? i} item={item} />
      ))}
    </div>
  );
}
