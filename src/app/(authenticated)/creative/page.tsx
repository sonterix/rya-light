'use client';

import { useState } from 'react';

import { CreativeOutputList } from '@/components/creative/creative-output-list';
import { NoAudiencePrompt } from '@/components/creative/no-audience-prompt';
import { WorkflowTypeSelector } from '@/components/creative/workflow-type-selector';
import { Button } from '@/components/ui/button';
import { useAudiences } from '@/hooks/use-audiences';
import type { WorkflowType } from '@/hooks/use-creative';
import { useCreativeOutputs, useOpenAIStatus } from '@/hooks/use-creative';
import { useGenerateCampaign } from '@/hooks/use-generate-campaign';
import { useGenerateMessaging } from '@/hooks/use-generate-messaging';
import { useGenerateOpportunity } from '@/hooks/use-generate-opportunity';
import { useGeneratePersona } from '@/hooks/use-generate-persona';
import { useAudienceStore } from '@/stores/audience-store';

export default function CreativePage() {
  const selectedAudienceId = useAudienceStore((s) => s.selectedAudienceId);
  const [selectedType, setSelectedType] = useState<WorkflowType>('persona');

  const { data: audiences } = useAudiences();
  const { data: outputs, isLoading: outputsLoading } = useCreativeOutputs(selectedAudienceId, selectedType);
  const { data: openAIConfigured } = useOpenAIStatus();

  const { generate: generatePersona, isGenerating: isGeneratingPersona, error: personaError } = useGeneratePersona();
  const { generate: generateCampaign, isGenerating: isGeneratingCampaign, error: campaignError } = useGenerateCampaign();
  const { generate: generateMessaging, isGenerating: isGeneratingMessaging, error: messagingError } = useGenerateMessaging();
  const { generate: generateOpportunity, isGenerating: isGeneratingOpportunity, error: opportunityError } = useGenerateOpportunity();

  const selectedAudience = audiences?.find((a) => a.id === selectedAudienceId);

  const generatingMap: Record<string, boolean> = {
    persona: isGeneratingPersona,
    campaign: isGeneratingCampaign,
    messaging: isGeneratingMessaging,
    opportunity: isGeneratingOpportunity,
  };
  const isGenerating = generatingMap[selectedType] ?? false;

  const errorMap: Record<string, string | null> = {
    persona: personaError,
    campaign: campaignError,
    messaging: messagingError,
    opportunity: opportunityError,
  };
  const generateError = errorMap[selectedType] ?? null;

  const generatingLabelMap: Record<string, string> = {
    persona: 'persona',
    campaign: 'campaign concepts',
    messaging: 'messaging angles',
    opportunity: 'content opportunities',
  };
  const generatingLabel = generatingLabelMap[selectedType] ?? selectedType;

  function handleGenerate() {
    if (!selectedAudienceId) return;
    if (selectedType === 'persona') {
      generatePersona(selectedAudienceId);
    } else if (selectedType === 'campaign') {
      generateCampaign(selectedAudienceId);
    } else if (selectedType === 'messaging') {
      generateMessaging(selectedAudienceId);
    } else if (selectedType === 'opportunity') {
      generateOpportunity(selectedAudienceId);
    }
  }

  if (!selectedAudienceId) {
    return <NoAudiencePrompt />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Creative</h1>
          {selectedAudience && (
            <p className="text-muted-foreground mt-1 text-sm">
              Audience: {selectedAudience.name}
            </p>
          )}
        </div>
      </div>

      {openAIConfigured === false && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          OpenAI API key is not configured. Add{' '}
          <code className="font-mono font-semibold">OPENAI_API_KEY</code> to your{' '}
          <code className="font-mono font-semibold">.env.local</code> to enable AI features.
        </div>
      )}

      <WorkflowTypeSelector
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {isGenerating && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Generating {generatingLabel}...
        </div>
      )}

      {generateError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <span>{generateError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            className="ml-4 border-red-300 text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200"
          >
            Try again
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Output History</h2>
          <Button
            disabled={!openAIConfigured || isGenerating}
            aria-disabled={!openAIConfigured || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        <CreativeOutputList
          outputs={outputs ?? []}
          isLoading={outputsLoading}
          audienceId={selectedAudienceId ?? ''}
        />
      </div>
    </div>
  );
}
