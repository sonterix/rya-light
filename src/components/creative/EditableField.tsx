'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [isEditing, draft]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        autoFocus
        rows={1}
        className={cn(
          'w-full resize-none rounded border border-input bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-ring',
          className,
        )}
      />
    );
  }

  return (
    <p
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
    </p>
  );
}
