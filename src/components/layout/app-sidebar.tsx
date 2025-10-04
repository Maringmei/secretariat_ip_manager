'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ManipurEmblem } from '../icons/manipur-emblem';
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut } from 'lucide-react';
import { MOCK_LOGGED_IN_USER } from '@/lib/data';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/requests', label: 'My Requests', icon: FileText },
    { href: '/profile', label: 'My Profile', icon: User },
];

const adminMenuItems = [
    { href: '/ip-management', label: 'IP Management', icon: Network, roles: ['admin', 'coordinator'] },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
    { href: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
];


export default function AppSidebar() {
    const pathname = usePathname();
    const userRole = MOCK_LOGGED_IN_USER.role;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <ManipurEmblem className="size-8 text-sidebar-primary" />
            <span className="truncate text-lg font-semibold font-headline">IP Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
          {adminMenuItems.map((item) => (
            item.roles.includes(userRole) && (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Link href="/" legacyBehavior passHref>
            <SidebarMenuButton asChild tooltip="Logout">
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
