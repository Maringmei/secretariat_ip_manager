
'use client';

import { usePathname, useRouter } from 'next/navigation';
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
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { ManipurEmblem } from '../icons/manipur-emblem';
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut, Inbox, FileClock, FileCheck, FileX, History, FilePlus } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { useCounter } from '../counter/counter-provider';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    types?: string[];
    countKey?: string;
}

const menuItems: MenuItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, types: ['official', 'requester'] },
    { href: '/profile', label: 'My Profile', icon: User, types: ['official'] },
];

const requesterMenuItems: MenuItem[] = [
    { href: '/my-pending-requests', label: 'Pending Requests', icon: FileClock, types: ['requester'] },
    { href: '/my-approved-requests', label: 'Approved Requests', icon: FileCheck, types: ['requester'] },
    { href: '/my-rejected-requests', label: 'Rejected Requests', icon: FileX, types: ['requester'] },
];

const adminMenuItems: MenuItem[] = [
    { href: '/new-requests', label: 'New Requests', icon: Inbox, types: ['official'], countKey: 'new' },
    { href: '/pending-approval', label: 'Pending Approval', icon: FileClock, types: ['official'], countKey: 'pending_approval' },
    { href: '/approved-requests', label: 'Approved', icon: FileCheck, types: ['official'], countKey: 'approved' },
    { href: '/rejected-requests', label: 'Rejected', icon: FileX, types: ['official'], countKey: 'rejected_requests' },
    { href: '/settings', label: 'Settings', icon: Settings, types: ['official'] },
    { href: '/users', label: 'User Management', icon: Users, types: ['official'] },
];


export default function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { counts } = useCounter();
    const router = useRouter();

    const userType = user?.type || 'requester'; 

    const handleLogout = () => {
      logout();
      router.push('/');
    };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <ManipurEmblem className="size-8 text-sidebar-primary bg-white rounded-full p-1"/>
            <span className="text-lg font-semibold font-headline whitespace-normal">Critical Infrastructure Portal, Manipur</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            (!item.types || item.types.includes(userType)) &&
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {userType === 'requester' && <SidebarSeparator />}

          {requesterMenuItems.map((item) => (
            item.types && item.types.includes(userType) &&
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {userType === 'official' && <SidebarSeparator />}
          
          {adminMenuItems.map((item) => {
            const count = item.countKey ? counts[item.countKey as keyof typeof counts] : undefined;
            return (
              item.types && item.types.includes(userType) && (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
