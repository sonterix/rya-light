import { DetailField } from './DetailField';
import type { Props as DetailFieldProps } from './DetailField';

export interface Props {
  title: string;
  fields: DetailFieldProps[];
}

export function DetailGroup({ title, fields }: Props) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {fields.map((field) => (
          <DetailField key={field.label} label={field.label} value={field.value} />
        ))}
      </dl>
    </div>
  );
}
