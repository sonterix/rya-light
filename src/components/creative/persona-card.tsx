import { MapPin, Target, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PersonaSchema } from '@/lib/schemas/persona-schema';

interface Props {
  persona: Partial<PersonaSchema> | null;
  isGenerating?: boolean;
}

export function PersonaCard({ persona, isGenerating = false }: Props) {
  if (!persona && isGenerating) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!persona) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        {persona.name ? (
          <CardTitle className="text-xl">{persona.name}</CardTitle>
        ) : (
          <Skeleton className="h-6 w-48" />
        )}

        {persona.demographicSummary ? (
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {persona.demographicSummary}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {persona.topInterests !== undefined && persona.topInterests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <Target className="h-3.5 w-3.5" />
              Top Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {persona.topInterests.map((interest) => (
                <span
                  key={interest.genreName}
                  className="bg-secondary text-secondary-foreground inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium"
                >
                  {interest.genreName}
                </span>
              ))}
            </div>
          </div>
        )}

        {persona.lifestyleDescription ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-relaxed">{persona.lifestyleDescription}</p>
          </div>
        ) : null}

        {persona.howToReachThem ? (
          <div className="bg-muted/50 flex flex-col gap-1.5 rounded-lg p-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <MapPin className="h-3.5 w-3.5" />
              How to Reach Them
            </p>
            <p className="text-sm leading-relaxed">{persona.howToReachThem}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
