import { Label } from '@/components/ui/label';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: Props) {
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="border-border bg-surface-container-lowest rounded-lg border p-3">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                selected.includes(option)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface-container-low text-foreground hover:bg-muted'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
