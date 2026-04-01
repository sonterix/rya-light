import type { User } from '@supabase/supabase-js';

import { createClient } from './server';

export interface AuthResult {
  user: User;
}

export async function getAuthUser(): Promise<AuthResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { user };
}
