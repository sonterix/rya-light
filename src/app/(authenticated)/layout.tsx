import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppSidebar } from '@/components/shared/app-sidebar';
import { AudienceAutoSelectProvider } from '@/components/shared/audience-auto-select-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/server';

interface Props {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email ?? ''} />
      <SidebarInset>
        <header className="flex h-12 items-center border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col p-6"><AudienceAutoSelectProvider>{children}</AudienceAutoSelectProvider></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
