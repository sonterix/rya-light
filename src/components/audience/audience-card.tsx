'use client';

import { Filter, Pencil, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card
        className={`w-full cursor-pointer transition-colors ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      >
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>{audience.name}</CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              {new Date(audience.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
