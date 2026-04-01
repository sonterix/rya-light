import type { PersonaContent } from '@/types/creative';

import { EditableField } from './EditableField';

interface Props {
  content: PersonaContent;
  onFieldSave: (c: PersonaContent) => void;
}

export function EditablePersonaContent({ content, onFieldSave }: Props) {
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
