import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export function NoAudiencePrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-muted-foreground text-lg">
        No audience selected. Go to the dashboard to select or create one.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Go to Dashboard
      </Link>
    </div>
  );
}
