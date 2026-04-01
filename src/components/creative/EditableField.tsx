'use client';

import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableField({ value, onSave, placeholder, className }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
  }, [value]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  }, [draft, value, onSave]);

  const cancelEdit = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        autoFocus
        className={cn(
          'w-full rounded border border-input bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-ring',
          className,
        )}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={startEditing}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') startEditing();
      }}
      className={cn(
        'cursor-text rounded px-1 py-0.5 hover:bg-muted/50',
        !value && 'text-muted-foreground italic',
        className,
      )}
    >
      {value || placeholder}
    </span>
  );
}
