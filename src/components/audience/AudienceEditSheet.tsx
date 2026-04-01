'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { AudienceEditForm } from './AudienceEditForm';

interface Props {
  audienceId: string | null;
  onClose: () => void;
}

export function AudienceEditSheet({ audienceId, onClose }: Props) {
  return (
    <Sheet
      open={audienceId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Audience</SheetTitle>
        </SheetHeader>
        {audienceId && <AudienceEditForm key={audienceId} audienceId={audienceId} />}
      </SheetContent>
    </Sheet>
  );
}
