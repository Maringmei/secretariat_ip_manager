
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
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut, Inbox, FileClock, FileCheck, FileX, History, FilePlus, CheckCheck, Archive } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { useCounter, Counts } from '../counter/counter-provider';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { LogoutConfirmationDialog } from '../auth/logout-confirmation-dialog';

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    types?: string[];
    countKey?: keyof Counts;
}

const menuItems: MenuItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, types: ['official', 'requester'] },
];

const requesterMenuItems: MenuItem[] = [
    { href: '/my-pending-requests', label: 'Pending Requests', icon: FileClock, types: ['requester'], countKey: 'pending_approval' },
    { href: '/my-approved-requests', label: 'Approved Requests', icon: FileCheck, types: ['requester'], countKey: 'approved' },
    { href: '/my-ready-requests', label: 'Ready', icon: CheckCheck, types: ['requester'], countKey: 'ready' },
    { href: '/my-closed-requests', label: 'Closed', icon: Archive, types: ['requester'], countKey: 'closed' },
    { href: '/reopened-requests', label: 'Reopened', icon: History, types: ['requester'], countKey: 're_opened' },
    { href: '/my-rejected-requests', label: 'Rejected Requests', icon: FileX, types: ['requester'], countKey: 'rejected' },
];

const adminMenuItems: MenuItem[] = [
    { href: '/new-requests', label: 'New Requests', icon: Inbox, types: ['official'], countKey: 'new' },
    { href: '/pending-approval', label: 'Pending Approval', icon: FileClock, types: ['official'], countKey: 'pending_approval' },
    { href: '/approved-requests', label: 'Approved', icon: FileCheck, types: ['official'], countKey: 'approved' },
    { href: '/ready-requests', label: 'Ready', icon: CheckCheck, types: ['official'], countKey: 'ready' },
    { href: '/closed-requests', label: 'Closed', icon: Archive, types: ['official'], countKey: 'closed' },
    { href: '/reopened-requests', label: 'Reopened', icon: History, types: ['official'], countKey: 're_opened' },
    { href: '/rejected-requests', label: 'Rejected', icon: FileX, types: ['official'], countKey: 'rejected' },
    { href: '/settings', label: 'Settings', icon: Settings, types: ['official'] },
    { href: '/users', label: 'User Management', icon: Users, types: ['official'] },
];


export default function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { counts } = useCounter();
    const router = useRouter();
    const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const userType = user?.type || 'requester'; 

    const handleLogout = () => {
      logout();
      router.push('/');
    };

    const openLogoutDialog = () => {
        setLogoutDialogOpen(true);
    };

    const renderMenuItem = (item: MenuItem) => {
      const countData = item.countKey ? counts[item.countKey] : undefined;
      const count = countData?.count;
      const highlight = countData?.highlight;

      return (
        (!item.types || item.types.includes(userType)) &&
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
              {count && count > 0 ? (
                <SidebarMenuBadge variant={highlight ? 'destructive' : 'default'}>
                  {count}
                </SidebarMenuBadge>
              ) : null}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

  return (
    <>
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
            <ManipurEmblem className="size-9 text-sidebar-primary bg-white rounded-full p-1"/>
            <span className="text-base font-bold font-headline leading-tight">Critical Infrastructure Portal, Government of Manipur</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(renderMenuItem)}
          
          {(userType === 'requester' && requesterMenuItems.length > 0) && <SidebarSeparator />}

          {requesterMenuItems.map(renderMenuItem)}
          
          {userType === 'official' && <SidebarSeparator />}
          
          {adminMenuItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton onClick={openLogoutDialog} tooltip="Logout">
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
    <LogoutConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
    />
    </>
  );
}
