'use client';

import { Filter, Pencil, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Audience } from '@/db/schema';

interface Props {
  audience: Audience;
  respondentCount: number;
  filterCount: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AudienceCard({ audience, respondentCount, filterCount, isActive, onSelect, onEdit, onDelete }: Props) {
  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit(audience.id);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(audience.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={audience.name}
      onClick={() => onSelect(audience.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(audience.id);
        }
      }}
      className="w-full text-left"
    >
      <div
        className={`w-full cursor-pointer rounded-lg border px-4 py-3 transition-colors ${
          isActive
            ? 'border-l-[3px] border-l-primary bg-primary/5'
            : 'border-transparent bg-card hover:bg-muted/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold">{audience.name}</p>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit audience"
              onClick={handleEdit}
              className="size-7 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete audience"
              onClick={handleDelete}
              className="size-7 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {respondentCount} respondents
          </span>
          {filterCount > 0 && (
            <span className="flex items-center gap-1">
              <Filter className="size-3.5" />
              {filterCount} filters
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
