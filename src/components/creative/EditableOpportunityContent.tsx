import type { OpportunityContent, OpportunityItem } from '@/types/creative';

import { EditableField } from './EditableField';

const confidenceColors: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-zinc-100 text-zinc-600',
};

interface Props {
  content: OpportunityContent;
  onFieldSave: (c: OpportunityContent) => void;
}

export function EditableOpportunityContent({ content, onFieldSave }: Props) {
  function updateOpportunityField(index: number, field: keyof OpportunityItem, value: string) {
    const updatedOpportunities = content.opportunities.map((opp, idx) =>
      idx === index ? { ...opp, [field]: value } : opp,
    );
    onFieldSave({ ...content, opportunities: updatedOpportunities });
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.opportunities.map((item, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={item.gapGenre ?? ''}
              placeholder="Gap genre"
              onSave={(v) => updateOpportunityField(i, 'gapGenre', v)}
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
            onSave={(v) => updateOpportunityField(i, 'crossoverConcept', v)}
            className="mb-2"
          />
          <div className="mt-2 rounded-md border border-border bg-surface-container-high/60 p-3">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reasoning</p>
            <EditableField
              value={item.reasoning ?? ''}
              placeholder="Reasoning"
              onSave={(v) => updateOpportunityField(i, 'reasoning', v)}
              className="text-muted-foreground"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
