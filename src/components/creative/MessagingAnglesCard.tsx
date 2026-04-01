import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MessagingSchema } from '@/lib/schemas/messaging-schema';

import { AngleCard } from './AngleCard';

interface Props {
  messaging: Partial<MessagingSchema> | null;
  isGenerating?: boolean;
}

export function MessagingAnglesCard({ messaging, isGenerating = false }: Props) {
  if (!messaging && isGenerating) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!messaging) {
    return null;
  }

  const angles = messaging.angles ?? [];

  if (angles.length === 0 && isGenerating) {
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
      {angles.map((angle, i) => (
        <AngleCard key={angle.name ?? i} angle={angle} />
      ))}
    </div>
  );
}
