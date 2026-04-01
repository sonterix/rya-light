import { Skeleton } from '@/components/ui/skeleton';

export function DetailPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
