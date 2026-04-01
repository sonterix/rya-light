'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  currentPage: number;
  totalPages: number;
}

export function RespondentPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;
        const isCurrent = page === currentPage;

        return (
          <Link
            key={page}
            href={`/respondents?page=${page}`}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: isCurrent ? 'default' : 'ghost', size: 'sm' }),
              'min-w-8',
              isCurrent && 'pointer-events-none',
            )}
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
