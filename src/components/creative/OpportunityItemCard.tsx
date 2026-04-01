import { Lightbulb, TrendingDown, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { OpportunityItemSchema } from '@/lib/schemas/opportunity-schema';

const CONFIDENCE_STYLES: Record<OpportunityItemSchema['confidence'], string> = {
  high: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400',
};

interface Props {
  item: Partial<OpportunityItemSchema>;
}

export function OpportunityItemCard({ item }: Props) {
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
