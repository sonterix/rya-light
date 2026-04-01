'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorkflowType } from '@/hooks/use-creative';
import { useRefineCreative } from '@/hooks/use-refine-creative';

interface Preset {
  label: string;
  instruction: string;
  requiresGenre?: boolean;
  requiresTrait?: boolean;
}

const PRESETS: Record<WorkflowType, Preset[]> = {
  persona: [
    { label: 'Add more detail', instruction: 'Add more detail' },
    { label: 'Make it shorter', instruction: 'Make it shorter' },
    { label: 'Focus on lifestyle habits', instruction: 'Focus on lifestyle habits' },
    { label: 'Focus on media consumption', instruction: 'Focus on media consumption' },
    { label: 'Emphasize demographics', instruction: 'Emphasize demographics' },
  ],
  campaign: [
    { label: 'Make it bolder', instruction: 'Make it bolder' },
    { label: 'Make it safer', instruction: 'Make it safer' },
    { label: 'Add more detail', instruction: 'Add more detail' },
    { label: 'Make it shorter', instruction: 'Make it shorter' },
    { label: 'Focus on [genre]', instruction: 'Focus on [genre]', requiresGenre: true },
    { label: 'Target different format', instruction: 'Target different format' },
  ],
  messaging: [
    { label: 'Make it more emotional', instruction: 'Make it more emotional' },
    { label: 'Make it more data-driven', instruction: 'Make it more data-driven' },
    { label: 'Add more detail', instruction: 'Add more detail' },
    { label: 'Make it shorter', instruction: 'Make it shorter' },
    { label: 'Focus on [genre]', instruction: 'Focus on [genre]', requiresGenre: true },
    { label: 'Shift hook to [trait]', instruction: 'Shift hook to [trait]', requiresTrait: true },
  ],
  opportunity: [
    { label: 'Add more detail', instruction: 'Add more detail' },
    { label: 'Make it shorter', instruction: 'Make it shorter' },
    { label: 'Explore deeper', instruction: 'Explore deeper' },
    { label: 'Focus on [genre]', instruction: 'Focus on [genre]', requiresGenre: true },
    { label: 'Suggest more crossover ideas', instruction: 'Suggest more crossover ideas' },
  ],
};

function getPresetDisplayLabel(preset: Preset, selectedGenre: string, selectedTrait: string): string {
  if (preset.requiresGenre && selectedGenre) {
    return preset.label.replace('[genre]', selectedGenre);
  }
  if (preset.requiresTrait && selectedTrait) {
    return preset.label.replace('[trait]', selectedTrait);
  }
  return preset.label;
}

interface Props {
  outputId: string;
  audienceId: string;
  type: WorkflowType;
  content: Record<string, unknown>;
  onRefined: (content: Record<string, unknown>) => void;
  genres?: string[];
  traits?: string[];
}

export function RefinementPanel({
  outputId,
  audienceId,
  type,
  content,
  onRefined,
  genres = [],
  traits = [],
}: Props) {
  const { refine, isRefining, error } = useRefineCreative(outputId, type);
  const [freeformPrompt, setFreeformPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(genres[0] ?? '');
  const [selectedTrait, setSelectedTrait] = useState(traits[0] ?? '');

  const presets = PRESETS[type];

  function buildInstruction(preset: Preset): string {
    let instruction = preset.instruction;
    if (preset.requiresGenre && selectedGenre) {
      instruction = instruction.replace('[genre]', selectedGenre);
    }
    if (preset.requiresTrait && selectedTrait) {
      instruction = instruction.replace('[trait]', selectedTrait);
    }
    return instruction;
  }

  function handlePresetClick(preset: Preset) {
    const instruction = buildInstruction(preset);
    void refine(content, instruction, audienceId, onRefined);
  }

  function handleFreeformSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && freeformPrompt.trim()) {
      void refine(content, freeformPrompt.trim(), audienceId, onRefined);
      setFreeformPrompt('');
    }
  }

  const hasGenrePreset = presets.some((p) => p.requiresGenre);
  const hasTraitPreset = presets.some((p) => p.requiresTrait);

  return (
    <div className="flex flex-col gap-3">
      {hasGenrePreset && genres.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="genre-select" className="text-muted-foreground text-xs font-medium">
            Genre
          </label>
          <select
            id="genre-select"
            aria-label="Genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border-input bg-background rounded border px-2 py-1 text-xs"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasTraitPreset && traits.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="trait-select" className="text-muted-foreground text-xs font-medium">
            Trait
          </label>
          <select
            id="trait-select"
            aria-label="Trait"
            value={selectedTrait}
            onChange={(e) => setSelectedTrait(e.target.value)}
            className="border-input bg-background rounded border px-2 py-1 text-xs"
          >
            {traits.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            disabled={isRefining}
            onClick={() => handlePresetClick(preset)}
            className="text-xs"
          >
            {getPresetDisplayLabel(preset, selectedGenre, selectedTrait)}
          </Button>
        ))}
      </div>

      <Input
        placeholder="Custom refinement prompt (press Enter to submit)"
        value={freeformPrompt}
        onChange={(e) => setFreeformPrompt(e.target.value)}
        onKeyDown={handleFreeformSubmit}
        disabled={isRefining}
        className="text-sm"
      />

      {error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
