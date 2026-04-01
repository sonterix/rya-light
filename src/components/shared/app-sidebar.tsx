'use client';

import { LayoutDashboard, LogOut, Paintbrush, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { label: 'Respondents', href: '/respondents', icon: Users },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Creative', href: '/creative', icon: Paintbrush },
] as const;

interface Props {
  userEmail: string;
}

export function AppSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  }

  return (
    <Sidebar collapsible="icon">
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
