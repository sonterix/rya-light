import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  label: string;
  minValue: number | undefined;
  maxValue: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

export function RangeInput({ label, minValue, maxValue, onMinChange, onMaxChange }: Props) {
  function parseValue(raw: string): number | undefined {
    const trimmed = raw.trim();
    if (trimmed === '') return undefined;
    const parsed = parseInt(trimmed, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  return (
    <div className="border-border bg-surface-container-lowest rounded-lg border p-3">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor={`${label}-min`} className="text-muted-foreground text-xs">
              {label} min
            </Label>
            <Input id={`${label}-min`} type="number" placeholder="Min" value={minValue ?? ''} onChange={(e) => onMinChange(parseValue(e.target.value))} />
          </div>
          <span className="text-muted-foreground mt-5">–</span>
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor={`${label}-max`} className="text-muted-foreground text-xs">
              {label} max
            </Label>
            <Input id={`${label}-max`} type="number" placeholder="Max" value={maxValue ?? ''} onChange={(e) => onMaxChange(parseValue(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}
