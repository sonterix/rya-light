'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { CreativeOutput } from '@/db/schema';
import { useDeleteCreativeOutput, usePatchCreativeOutput } from '@/hooks/use-creative';
import { useGenerateCampaign } from '@/hooks/use-generate-campaign';
import { useGenerateMessaging } from '@/hooks/use-generate-messaging';
import { useGenerateOpportunity } from '@/hooks/use-generate-opportunity';
import { useGeneratePersona } from '@/hooks/use-generate-persona';
import type { CreativeContent } from '@/types/creative';

import { EditableContent } from './EditableContent';
import { RefinementPanel } from './RefinementPanel';

interface Props {
  output: CreativeOutput;
  audienceId: string;
  genres?: string[];
  traits?: string[];
}

export function CreativeOutputEditCard({ output, audienceId, genres, traits }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const { mutate: deleteOutput, isPending: isDeleting } = useDeleteCreativeOutput();
  const { mutate: patchOutput } = usePatchCreativeOutput();

  const { generate: generatePersona, isGenerating: isGeneratingPersona } = useGeneratePersona();
  const { generate: generateCampaign, isGenerating: isGeneratingCampaign } = useGenerateCampaign();
  const { generate: generateMessaging, isGenerating: isGeneratingMessaging } = useGenerateMessaging();
  const { generate: generateOpportunity, isGenerating: isGeneratingOpportunity } = useGenerateOpportunity();

  const regeneratingMap: Record<string, boolean> = {
    persona: isGeneratingPersona,
    campaign: isGeneratingCampaign,
    messaging: isGeneratingMessaging,
    opportunity: isGeneratingOpportunity,
  };
  const isRegenerating = regeneratingMap[output.type] ?? false;

  const createdAt = new Date(output.createdAt).toLocaleString();
  const { content } = output;

  const handleConfirmRegenerate = useCallback(() => {
    setConfirmingRegenerate(false);
    if (output.type === 'persona') generatePersona(audienceId, output.id);
    else if (output.type === 'campaign') generateCampaign(audienceId, output.id);
    else if (output.type === 'messaging') generateMessaging(audienceId, output.id);
    else generateOpportunity(audienceId, output.id);
  }, [output.type, output.id, audienceId, generatePersona, generateCampaign, generateMessaging, generateOpportunity]);

  const handleSaveContent = useCallback((updatedContent: CreativeContent) => {
    patchOutput(
      { id: output.id, content: updatedContent },
      {
        onError: () => toast.error('Failed to save changes'),
      },
    );
  }, [output.id, patchOutput]);

  const handleRefined = useCallback((refinedContent: CreativeContent) => {
    patchOutput(
      { id: output.id, content: refinedContent },
      {
        onSuccess: () => toast.success('Output updated'),
        onError: () => toast.error('Failed to save refinement'),
      },
    );
  }, [output.id, patchOutput]);

  function handleDeleteClick() {
    setConfirmingDelete(true);
  }

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  function handleConfirmDelete() {
    deleteOutput(output.id, {
      onSuccess: () => toast.success('Output deleted'),
      onError: () => {
        toast.error('Failed to delete output');
        setConfirmingDelete(false);
      },
    });
  }

  return (
    <Card className="relative">
      {(isRegenerating || isRefining) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/95">
          <div className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            {isRegenerating ? 'Regenerating...' : 'Refining...'}
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <p className="text-muted-foreground text-xs">{createdAt}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <EditableContent
          type={output.type}
          content={content}
          onFieldSave={handleSaveContent}
        />

        <RefinementPanel
          outputId={output.id}
          audienceId={audienceId}
          type={output.type}
          content={content}
          onRefined={handleRefined}
          onRefiningChange={setIsRefining}
          genres={genres}
          traits={traits}
        />
      </CardContent>

      <CardFooter className="justify-end gap-2">
        {confirmingRegenerate && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingRegenerate(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirmRegenerate}
              disabled={isRegenerating}
            >
              Confirm
            </Button>
          </>
        )}
        {confirmingDelete && !confirmingRegenerate && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              Confirm
            </Button>
          </>
        )}
        {!confirmingRegenerate && !confirmingDelete && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingRegenerate(true)}
              disabled={isRegenerating}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              aria-label="Delete output"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
