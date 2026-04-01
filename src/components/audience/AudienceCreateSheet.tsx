'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Audience } from '@/db/schema';

import { AudienceCreateForm } from './AudienceCreateForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (audience: Audience) => void;
}

export function AudienceCreateSheet({ open, onOpenChange, onCreated }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create Audience</SheetTitle>
        </SheetHeader>
        {open && <AudienceCreateForm key={String(open)} onCreated={onCreated} onClose={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}
