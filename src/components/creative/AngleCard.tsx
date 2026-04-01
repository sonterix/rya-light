import { Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MessagingAngleSchema } from '@/lib/schemas/messaging-schema';

interface Props {
  angle: Partial<MessagingAngleSchema>;
}

export function AngleCard({ angle }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        {angle.name ? (
          <CardTitle className="text-base">{angle.name}</CardTitle>
        ) : (
          <Skeleton className="h-5 w-40" />
        )}

        {angle.tone ? (
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <span className="font-semibold">Tone:</span> {angle.tone}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {angle.sampleHeadline ? (
          <p className="text-foreground border-l-primary border-l-2 pl-3 text-base font-semibold leading-snug italic">
            {angle.sampleHeadline}
          </p>
        ) : null}

        {angle.emotionalHook ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{angle.emotionalHook}</p>
        ) : null}

        {angle.keyTrait ? (
          <div className="flex items-center gap-1.5">
            <Zap className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium">
              {angle.keyTrait}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
