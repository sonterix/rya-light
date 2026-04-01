import type { CampaignConcept, CampaignContent } from '@/types/creative';

import { EditableField } from './EditableField';

interface Props {
  content: CampaignContent;
  onFieldSave: (c: CampaignContent) => void;
}

export function EditableCampaignContent({ content, onFieldSave }: Props) {
  function updateConceptField(index: number, field: keyof CampaignConcept, value: string) {
    const updatedConcepts = content.concepts.map((concept, idx) =>
      idx === index ? { ...concept, [field]: value } : concept,
    );
    onFieldSave({ ...content, concepts: updatedConcepts });
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.concepts.map((concept, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={concept.name ?? ''}
              placeholder="Concept name"
              onSave={(v) => updateConceptField(i, 'name', v)}
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
            onSave={(v) => updateConceptField(i, 'tagline', v)}
            className="italic text-muted-foreground"
          />
          <EditableField
            value={concept.description ?? ''}
            placeholder="Description"
            onSave={(v) => updateConceptField(i, 'description', v)}
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
