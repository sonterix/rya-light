import type { MessagingAngle, MessagingContent } from '@/types/creative';

import { EditableField } from './EditableField';

interface Props {
  content: MessagingContent;
  onFieldSave: (c: MessagingContent) => void;
}

export function EditableMessagingContent({ content, onFieldSave }: Props) {
  function updateAngleField(index: number, field: keyof MessagingAngle, value: string) {
    const updatedAngles = content.angles.map((angle, idx) =>
      idx === index ? { ...angle, [field]: value } : angle,
    );
    onFieldSave({ ...content, angles: updatedAngles });
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      {content.angles.map((angle, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <EditableField
              value={angle.name ?? ''}
              placeholder="Angle name"
              onSave={(v) => updateAngleField(i, 'name', v)}
              className="text-base font-semibold"
            />
            {angle.tone && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {angle.tone}
              </span>
            )}
          </div>
          <div className="border-l-2 border-l-primary/30 pl-3">
            <EditableField
              value={angle.sampleHeadline ?? ''}
              placeholder="Sample headline"
              onSave={(v) => updateAngleField(i, 'sampleHeadline', v)}
              className="italic"
            />
          </div>
          <EditableField
            value={angle.emotionalHook ?? ''}
            placeholder="Emotional hook"
            onSave={(v) => updateAngleField(i, 'emotionalHook', v)}
            className="text-muted-foreground"
          />
          {angle.keyTrait && (
            <div className="mt-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {angle.keyTrait}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
