'use client';

import { useState } from 'react';

import { CreativeOutputList } from '@/components/creative/creative-output-list';
import { NoAudiencePrompt } from '@/components/creative/no-audience-prompt';
import { WorkflowTypeSelector } from '@/components/creative/workflow-type-selector';
import { Button } from '@/components/ui/button';
import { useAudiences } from '@/hooks/use-audiences';
import type { WorkflowType } from '@/hooks/use-creative';
import { useCreativeOutputs, useOpenAIStatus } from '@/hooks/use-creative';
import { useAudienceStore } from '@/stores/audience-store';

export default function CreativePage() {
  const selectedAudienceId = useAudienceStore((s) => s.selectedAudienceId);
  const [selectedType, setSelectedType] = useState<WorkflowType>('persona');

  const { data: audiences } = useAudiences();
  const { data: outputs, isLoading: outputsLoading } = useCreativeOutputs(selectedAudienceId, selectedType);
  const { data: openAIConfigured } = useOpenAIStatus();

  const selectedAudience = audiences?.find((a) => a.id === selectedAudienceId);

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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Output History</h2>
          <Button disabled={!openAIConfigured} aria-disabled={!openAIConfigured}>
            Generate
          </Button>
        </div>

        <CreativeOutputList
          outputs={outputs ?? []}
          isLoading={outputsLoading}
        />
      </div>
    </div>
  );
}
