import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_ROW_COUNT = 10;

export function RespondentTableSkeleton() {
  return (
    <div className="rounded-md border border-border">
      <div className="grid grid-cols-6 gap-4 border-b border-border px-4 py-3">
        {['ID', 'Audience Category', 'Age', 'Gender', 'Location', 'Household Income'].map(
          (col) => (
            <div key={col} className="text-sm font-medium text-muted-foreground">
              {col}
            </div>
          ),
        )}
      </div>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 border-b border-border px-4 py-3 last:border-0">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
