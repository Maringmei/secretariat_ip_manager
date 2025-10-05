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
} from '@/components/ui/sidebar';
import { ManipurEmblem } from '../icons/manipur-emblem';
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut, Inbox, FileClock, FileCheck, FileX } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/requests', label: 'My Requests', icon: FileText, types: ['requester'] },
    { href: '/profile', label: 'My Profile', icon: User },
];

const adminMenuItems = [
    { href: '/new-requests', label: 'New Requests', icon: Inbox, types: ['official'] },
    { href: '/pending-approval', label: 'Pending Approval', icon: FileClock, types: ['official'] },
    { href: '/approved-requests', label: 'Approved', icon: FileCheck, types: ['official'] },
    { href: '/rejected-requests', label: 'Rejected', icon: FileX, types: ['official'] },
    { href: '/ip-management', label: 'IP Management', icon: Network, types: ['official'] },
    { href: '/settings', label: 'Settings', icon: Settings, types: ['official'] },
    { href: '/users', label: 'User Management', icon: Users, types: ['official'] },
];


export default function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
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
            <ManipurEmblem className="size-8 text-sidebar-primary" />
            <span className="truncate text-lg font-semibold font-headline">IP Manager</span>
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
          
          {userType === 'official' && <SidebarSeparator />}
          
          {adminMenuItems.map((item) => (
            item.types.includes(userType) && (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          ))}
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
