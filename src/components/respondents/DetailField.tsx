export interface Props {
  label: string;
  value: string | number;
}

export function DetailField({ label, value }: Props) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}
