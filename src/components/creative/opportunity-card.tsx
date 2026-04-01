import { Lightbulb, TrendingDown, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { OpportunityItemSchema, OpportunitySchema } from '@/lib/schemas/opportunity-schema';

interface Props {
  opportunity: Partial<OpportunitySchema> | null;
  isGenerating?: boolean;
}

const CONFIDENCE_STYLES: Record<OpportunityItemSchema['confidence'], string> = {
  high: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400',
};

function OpportunityItemCard({ item }: { item: Partial<OpportunityItemSchema> }) {
  const confidence = item.confidence;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            {item.gapGenre ? (
              <CardTitle className="text-base">{item.gapGenre}</CardTitle>
            ) : (
              <Skeleton className="h-5 w-32" />
            )}
          </div>
          {confidence && (
            <span className={CONFIDENCE_STYLES[confidence]}>{confidence}</span>
          )}
        </div>

        {item.audienceTrait ? (
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
            <User className="h-3.5 w-3.5 shrink-0" />
            {item.audienceTrait}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {item.crossoverConcept ? (
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <Lightbulb className="h-3.5 w-3.5" />
              Crossover Concept
            </p>
            <p className="text-sm leading-relaxed">{item.crossoverConcept}</p>
          </div>
        ) : null}

        {item.reasoning ? (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs leading-relaxed">{item.reasoning}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
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
