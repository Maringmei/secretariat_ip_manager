
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
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut, Inbox, FileClock, FileCheck, FileX, History, FilePlus, CheckCheck, Archive, Search } from 'lucide-react';
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
    accessKey?: string;
}

const menuItems: MenuItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, types: ['official', 'requester'], accessKey: 'Dashboard' },
];

const requesterMenuItems: MenuItem[] = [
    { href: '/my-pending-requests', label: 'Pending Requests', icon: FileClock, types: ['requester'], countKey: 'pending_approval', accessKey: 'Pending' },
    { href: '/my-approved-requests', label: 'Approved Requests', icon: FileCheck, types: ['requester'], countKey: 'approved', accessKey: 'Approved' },
    { href: '/my-ready-requests', label: 'Ready', icon: CheckCheck, types: ['requester'], countKey: 'ready', accessKey: 'Ready' },
    { href: '/my-closed-requests', label: 'Closed', icon: Archive, types: ['requester'], countKey: 'closed', accessKey: 'Closed' },
    { href: '/reopened-requests', label: 'Reopened', icon: History, types: ['requester'], countKey: 're_opened', accessKey: 'Reopened' },
    { href: '/my-rejected-requests', label: 'Rejected Requests', icon: FileX, types: ['requester'], countKey: 'rejected', accessKey: 'Rejected' },
];

const adminMenuItems: MenuItem[] = [
    { href: '/new-requests', label: 'New Requests', icon: Inbox, types: ['official'], countKey: 'new', accessKey: 'New Requests' },
    { href: '/pending-approval', label: 'Pending Approval', icon: FileClock, types: ['official'], countKey: 'pending_approval', accessKey: 'Pending' },
    { href: '/approved-requests', label: 'Approved', icon: FileCheck, types: ['official'], countKey: 'approved', accessKey: 'Approved' },
    { href: '/ready-requests', label: 'Ready', icon: CheckCheck, types: ['official'], countKey: 'ready', accessKey: 'Ready' },
    { href: '/closed-requests', label: 'Closed', icon: Archive, types: ['official'], countKey: 'closed', accessKey: 'Closed' },
    { href: '/reopened-requests', label: 'Reopened', icon: History, types: ['official'], countKey: 're_opened', accessKey: 'Reopened' },
    { href: '/rejected-requests', label: 'Rejected', icon: FileX, types: ['official'], countKey: 'rejected', accessKey: 'Rejected' },
    { href: '/search-ip', label: 'Search by IP', icon: Search, types: ['official'], accessKey: 'Search by IP' },
    { href: '/settings', label: 'Settings', icon: Settings, types: ['official'], accessKey: 'Settings' },
    { href: '/users', label: 'User Management', icon: Users, types: ['official'], accessKey: 'User Management' },
];


export default function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { counts } = useCounter();
    const router = useRouter();
    const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const userType = user?.type || 'requester'; 
    const userAccess = user?.access || [];

    const handleLogout = () => {
      logout();
      router.push('/');
    };

    const openLogoutDialog = () => {
        setLogoutDialogOpen(true);
    };

    const isMenuItemVisible = (item: MenuItem) => {
        if (!item.types?.includes(userType)) {
            return false;
        }
        // If the user has a specific list of accessible items, check against it.
        if (userAccess.length > 0 && item.accessKey) {
            return userAccess.includes(item.accessKey);
        }
        // If no access list is provided, default to showing the item based on type.
        // Or if the item doesn't have an accessKey, it's considered public for that type.
        if (userAccess.length === 0) {
            return true;
        }
        
        // Hide items with an accessKey if userAccess is populated but doesn't include the key
        return !item.accessKey;
    };

    const renderMenuItem = (item: MenuItem) => {
      if (!isMenuItemVisible(item)) {
        return null;
      }
      
      const countData = item.countKey ? counts[item.countKey] : undefined;
      const count = countData?.count;
      const highlight = countData?.highlight;

      return (
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
          
          {(userType === 'requester' && requesterMenuItems.some(isMenuItemVisible)) && <SidebarSeparator />}

          {requesterMenuItems.map(renderMenuItem)}
          
          {(userType === 'official' && adminMenuItems.some(isMenuItemVisible)) && <SidebarSeparator />}
          
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
