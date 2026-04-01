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
import type {
  CampaignContent,
  MessagingContent,
  OpportunityContent,
  PersonaContent,
} from '@/types/creative';

import { EditableField } from './editable-field';
import { RefinementPanel } from './refinement-panel';

type WorkflowType = 'persona' | 'campaign' | 'messaging' | 'opportunity';

interface EditableContentProps {
  type: WorkflowType;
  content: Record<string, unknown>;
  onFieldSave: (updated: Record<string, unknown>) => void;
}

function EditablePersonaContent({ content, onFieldSave }: { content: PersonaContent; onFieldSave: (c: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <EditableField
        value={content.name}
        onSave={(v) => onFieldSave({ ...content, name: v })}
        className="text-lg font-semibold"
      />
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Demographics</p>
        <EditableField
          value={content.demographicSummary}
          onSave={(v) => onFieldSave({ ...content, demographicSummary: v })}
        />
      </div>
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Lifestyle</p>
        <EditableField
          value={content.lifestyleDescription}
          onSave={(v) => onFieldSave({ ...content, lifestyleDescription: v })}
        />
      </div>
      <div className="rounded-lg bg-primary/5 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">How to reach them</p>
        <EditableField
          value={content.howToReachThem}
          onSave={(v) => onFieldSave({ ...content, howToReachThem: v })}
        />
      </div>
    </div>
  );
}

function EditableCampaignContent({ content, onFieldSave }: { content: CampaignContent; onFieldSave: (c: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.concepts.map((concept, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={concept.name ?? ''}
              placeholder="Concept name"
              onSave={(v) => {
                const updated = { ...content, concepts: content.concepts.map((c, idx) => idx === i ? { ...c, name: v } : c) };
                onFieldSave(updated as unknown as Record<string, unknown>);
              }}
              className="text-base font-semibold"
            />
            {concept.suggestedFormat && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {concept.suggestedFormat}
              </span>
            )}
          </div>
          <EditableField
            value={concept.tagline ?? ''}
            placeholder="Tagline"
            onSave={(v) => {
              const updated = { ...content, concepts: content.concepts.map((c, idx) => idx === i ? { ...c, tagline: v } : c) };
              onFieldSave(updated as unknown as Record<string, unknown>);
            }}
            className="mb-2 italic text-muted-foreground"
          />
          <EditableField
            value={concept.description ?? ''}
            placeholder="Description"
            onSave={(v) => {
              const updated = { ...content, concepts: content.concepts.map((c, idx) => idx === i ? { ...c, description: v } : c) };
              onFieldSave(updated as unknown as Record<string, unknown>);
            }}
          />
          {concept.targetGenres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {concept.targetGenres.map((genre) => (
                <span key={genre} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditableMessagingContent({ content, onFieldSave }: { content: MessagingContent; onFieldSave: (c: Record<string, unknown>) => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.angles.map((angle, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={angle.name ?? ''}
              placeholder="Angle name"
              onSave={(v) => {
                const updated = { ...content, angles: content.angles.map((a, idx) => idx === i ? { ...a, name: v } : a) };
                onFieldSave(updated as unknown as Record<string, unknown>);
              }}
              className="text-base font-semibold"
            />
            {angle.tone && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {angle.tone}
              </span>
            )}
          </div>
          <EditableField
            value={angle.sampleHeadline ?? ''}
            placeholder="Sample headline"
            onSave={(v) => {
              const updated = { ...content, angles: content.angles.map((a, idx) => idx === i ? { ...a, sampleHeadline: v } : a) };
              onFieldSave(updated as unknown as Record<string, unknown>);
            }}
            className="mb-2 border-l-2 border-l-primary/30 pl-3 italic"
          />
          <EditableField
            value={angle.emotionalHook ?? ''}
            placeholder="Emotional hook"
            onSave={(v) => {
              const updated = { ...content, angles: content.angles.map((a, idx) => idx === i ? { ...a, emotionalHook: v } : a) };
              onFieldSave(updated as unknown as Record<string, unknown>);
            }}
            className="text-muted-foreground"
          />
          {angle.keyTrait && (
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {angle.keyTrait}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function EditableOpportunityContent({ content, onFieldSave }: { content: OpportunityContent; onFieldSave: (c: Record<string, unknown>) => void }) {
  const confidenceColors: Record<string, string> = {
    high: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-zinc-100 text-zinc-600',
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.opportunities.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={item.gapGenre ?? ''}
              placeholder="Gap genre"
              onSave={(v) => {
                const updated = { ...content, opportunities: content.opportunities.map((o, idx) => idx === i ? { ...o, gapGenre: v } : o) };
                onFieldSave(updated as unknown as Record<string, unknown>);
              }}
              className="text-base font-semibold"
            />
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColors[item.confidence] ?? confidenceColors.low}`}>
              {item.confidence}
            </span>
          </div>
          {item.audienceTrait && (
            <p className="mb-2 text-xs text-muted-foreground">{item.audienceTrait}</p>
          )}
          <EditableField
            value={item.crossoverConcept ?? ''}
            placeholder="Crossover concept"
            onSave={(v) => {
              const updated = { ...content, opportunities: content.opportunities.map((o, idx) => idx === i ? { ...o, crossoverConcept: v } : o) };
              onFieldSave(updated as unknown as Record<string, unknown>);
            }}
            className="mb-2"
          />
          <div className="rounded-md border border-border bg-surface-container-high/60 p-3">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reasoning</p>
            <EditableField
              value={item.reasoning ?? ''}
              placeholder="Reasoning"
              onSave={(v) => {
                const updated = { ...content, opportunities: content.opportunities.map((o, idx) => idx === i ? { ...o, reasoning: v } : o) };
                onFieldSave(updated as unknown as Record<string, unknown>);
              }}
              className="text-muted-foreground"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EditableContent({ type, content, onFieldSave }: EditableContentProps) {
  if (type === 'persona') {
    return (
      <EditablePersonaContent
        content={content as unknown as PersonaContent}
        onFieldSave={onFieldSave}
      />
    );
  }
  if (type === 'campaign') {
    return (
      <EditableCampaignContent
        content={content as unknown as CampaignContent}
        onFieldSave={onFieldSave}
      />
    );
  }
  if (type === 'messaging') {
    return (
      <EditableMessagingContent
        content={content as unknown as MessagingContent}
        onFieldSave={onFieldSave}
      />
    );
  }
  return (
    <EditableOpportunityContent
      content={content as unknown as OpportunityContent}
      onFieldSave={onFieldSave}
    />
  );
}

interface Props {
  output: CreativeOutput;
  audienceId: string;
  genres?: string[];
  traits?: string[];
}

export function CreativeOutputEditCard({ output, audienceId, genres, traits }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

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
  const content = output.content as Record<string, unknown>;

  const handleConfirmRegenerate = useCallback(() => {
    setConfirmingRegenerate(false);
    if (output.type === 'persona') generatePersona(audienceId, output.id);
    else if (output.type === 'campaign') generateCampaign(audienceId, output.id);
    else if (output.type === 'messaging') generateMessaging(audienceId, output.id);
    else generateOpportunity(audienceId, output.id);
  }, [output.type, output.id, audienceId, generatePersona, generateCampaign, generateMessaging, generateOpportunity]);

  const handleSaveContent = useCallback((updatedContent: Record<string, unknown>) => {
    patchOutput(
      { id: output.id, content: updatedContent },
      {
        onError: () => toast.error('Failed to save changes'),
      },
    );
  }, [output.id, patchOutput]);

  const handleRefined = useCallback((refinedContent: Record<string, unknown>) => {
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
      {isRegenerating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Regenerating...
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <p className="text-muted-foreground text-xs">{createdAt}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <EditableContent
          type={output.type as WorkflowType}
          content={content}
          onFieldSave={handleSaveContent}
        />

        <RefinementPanel
          outputId={output.id}
          audienceId={audienceId}
          type={output.type as WorkflowType}
          content={content}
          onRefined={handleRefined}
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
