'use client';

import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Audience } from '@/db/schema';

interface Props {
  audience: Audience;
  respondentCount: number;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function AudienceCard({ audience, respondentCount, isActive, onSelect }: Props) {
  return (
    <Button
      variant="ghost"
      aria-pressed={isActive}
      onClick={() => onSelect(audience.id)}
      className="h-auto w-full p-0 text-left"
    >
      <Card
        className={`w-full cursor-pointer transition-colors ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      >
        <CardHeader>
          <CardTitle>{audience.name}</CardTitle>
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
