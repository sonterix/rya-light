'use client';

import type { ReactNode } from 'react';

import { useAudienceAutoSelect } from '@/hooks/use-audience-auto-select';

interface Props {
  children: ReactNode;
}

export function AudienceAutoSelectProvider({ children }: Props) {
  useAudienceAutoSelect();
  return <>{children}</>;
}
