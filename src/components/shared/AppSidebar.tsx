'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LayoutDashboard, LogOut, Paintbrush, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAudiences } from '@/hooks/use-audiences';
import { createClient } from '@/lib/supabase/client';
import { useAudienceStore } from '@/stores/audience-store';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Creative', href: '/creative', icon: Paintbrush },
  { label: 'Respondents', href: '/respondents', icon: Users },
] as const;

interface Props {
  userEmail: string;
}

export function AppSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);
  const clearSelectedAudienceId = useAudienceStore((state) => state.clearSelectedAudienceId);
  const { data: audiences } = useAudiences();

  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectedAudience = audiences?.find((a) => a.id === selectedAudienceId);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    clearSelectedAudienceId();
    router.push('/auth');
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenuButton render={<Link href="/dashboard" />} tooltip="Light">
          <span className="text-lg font-bold text-primary">R</span>
          <span>Light</span>
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarGroup className="border-b border-sidebar-border py-2">
        <SidebarGroupLabel className="text-sidebar-foreground/50">Audience</SidebarGroupLabel>
        <SidebarGroupContent>
          {!audiences || audiences.length === 0 ? (
            <p className="px-2 py-1 text-xs text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">
              No audiences yet
            </p>
          ) : (
            <div className="relative group-data-[collapsible=icon]:hidden">
              <button
                type="button"
                onClick={() => setSelectorOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <span className="truncate">{selectedAudience?.name ?? 'Select audience'}</span>
                <ChevronDown className={`size-3.5 shrink-0 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
              </button>
              {selectorOpen && (
                <div className="mt-1 flex flex-col gap-0.5 rounded-md bg-sidebar-accent/50 p-1">
                  {audiences.map((audience) => (
                    <button
                      key={audience.id}
                      type="button"
                      onClick={() => {
                        setSelectedAudienceId(audience.id);
                        setSelectorOpen(false);
                      }}
                      className={`truncate rounded-md px-2 py-1 text-left text-xs transition-colors ${
                        audience.id === selectedAudienceId
                          ? 'bg-primary text-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      {audience.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={label}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-1 px-1">
          <span className="truncate px-1 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            {userEmail}
          </span>
          <SidebarMenuButton tooltip="Sign Out" onClick={handleSignOut}>
            <LogOut />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
