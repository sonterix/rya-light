'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { CreativeOutput } from '@/db/schema';
import { useDeleteCreativeOutput } from '@/hooks/use-creative';
import type {
  CampaignContent,
  MessagingContent,
  OpportunityContent,
  PersonaContent,
} from '@/types/creative';

function getContentPreview(output: CreativeOutput): string {
  const content = output.content;

  if (output.type === 'persona') {
    const persona = content as PersonaContent;
    return persona.tagline
      ? `${persona.name} - ${persona.tagline}`
      : persona.name;
  }

  if (output.type === 'campaign') {
    const campaign = content as CampaignContent;
    return campaign.campaign_name;
  }

  if (output.type === 'messaging') {
    const messaging = content as MessagingContent;
    return messaging.primary_message;
  }

  if (output.type === 'opportunity') {
    const opportunity = content as OpportunityContent;
    return opportunity.headline;
  }

  return 'No preview available';
}

interface Props {
  output: CreativeOutput;
}

export function CreativeOutputCard({ output }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { mutate: deleteOutput, isPending } = useDeleteCreativeOutput();

  const preview = getContentPreview(output);
  const createdAt = new Date(output.createdAt).toLocaleString();

  function handleDeleteClick() {
    setConfirmingDelete(true);
  }

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  function handleConfirmDelete() {
    deleteOutput(output.id, {
      onSuccess: () => {
        toast.success('Output deleted');
      },
      onError: () => {
        toast.error('Failed to delete output');
        setConfirmingDelete(false);
      },
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="line-clamp-2 text-sm font-medium">{preview}</p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">{createdAt}</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {confirmingDelete ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDelete}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              Confirm
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            aria-label="Delete output"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
