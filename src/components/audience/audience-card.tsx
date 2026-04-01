'use client';

import { Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audience } from '@/db/schema';

interface Props {
  audience: Audience;
  respondentCount: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AudienceCard({ audience, respondentCount, isActive, onSelect, onDelete }: Props) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(audience.id);
  }

  return (
    <Button
      variant="ghost"
      aria-pressed={isActive}
      aria-label={audience.name}
      onClick={() => onSelect(audience.id)}
      className="h-auto w-full p-0 text-left"
    >
      <Card
        className={`w-full cursor-pointer transition-colors ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      >
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle>{audience.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete audience"
            onClick={handleDelete}
            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5" />
            <span className="text-xs">{respondentCount} respondents</span>
          </div>
        </CardContent>
      </Card>
    </Button>
  );
}
