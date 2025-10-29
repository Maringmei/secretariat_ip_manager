
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
import { LayoutDashboard, FileText, User, Network, Settings, Users, LogOut, Inbox, FileClock, FileCheck, FileX, History, FilePlus, CheckCheck, Archive, Search, ChevronDown, Briefcase, Ticket } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { useCounter, Counts } from '../counter/counter-provider';
import type { LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LogoutConfirmationDialog } from '../auth/logout-confirmation-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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

const ipRequestChildItems: MenuItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, types: ['requester'], accessKey: 'Dashboard' },
    { href: '/my-pending-requests', label: 'Pending Requests', icon: FileClock, types: ['requester'], countKey: 'pending_approval', accessKey: 'Pending' },
    { href: '/my-approved-requests', label: 'Approved Requests', icon: FileCheck, types: ['requester'], countKey: 'approved', accessKey: 'Approved' },
    { href: '/my-ready-requests', label: 'Ready', icon: CheckCheck, types: ['requester'], countKey: 'ready', accessKey: 'Ready' },
    { href: '/my-closed-requests', label: 'Closed', icon: Archive, types: ['requester'], countKey: 'closed', accessKey: 'Closed' },
    { href: '/reopened-requests', label: 'Reopened', icon: History, types: ['requester'], countKey: 're_opened', accessKey: 'Reopened' },
    { href: '/my-rejected-requests', label: 'Rejected Requests', icon: FileX, types: ['requester'], countKey: 'rejected', accessKey: 'Rejected' },
];

const eOfficeChildItems: MenuItem[] = [
    { href: '/e-office', label: 'E-office', icon: Briefcase, types: ['requester'], accessKey: 'E-office' },
    { href: '/e-office-pending-requests', label: 'Pending Requests', icon: FileClock, types: ['requester'], accessKey: 'E-office Pending' },
    { href: '/e-office-issues', label: 'Issues', icon: Ticket, types: ['requester'], accessKey: 'E-office Issues'},
]


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
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const userType = user?.type || 'requester'; 
    const userAccess = user?.access || [];

    useEffect(() => {
        if (userType === 'requester') {
            const isIpRequestActive = ipRequestChildItems.some(item => pathname.startsWith(item.href));
            const isEOfficeActive = eOfficeChildItems.some(item => pathname.startsWith(item.href));
            const activeMenus = [];
            if (isIpRequestActive) activeMenus.push('ipRequest');
            if (isEOfficeActive) activeMenus.push('eOffice');
            setOpenMenus(activeMenus);
        }
    }, [pathname, userType]);

    const toggleMenu = (menu: string) => {
        setOpenMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
    }

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
        if (userAccess.length > 0 && item.accessKey) {
            return userAccess.includes(item.accessKey);
        }
        if (userAccess.length === 0) {
            return true;
        }
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
    
    const renderCollapsibleMenu = (
        menuKey: string, 
        label: string, 
        icon: LucideIcon, 
        items: MenuItem[]
    ) => {
        const isVisible = items.some(isMenuItemVisible);
        if (!isVisible) return null;

        const isActive = items.some(item => pathname.startsWith(item.href));

        return (
            <Collapsible open={openMenus.includes(menuKey)} onOpenChange={() => toggleMenu(menuKey)}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive} className="justify-between">
                        <div className="flex items-center gap-2">
                            <icon />
                            <span>{label}</span>
                        </div>
                        <ChevronDown className={cn("transition-transform", openMenus.includes(menuKey) && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="flex flex-col gap-1 py-2 pl-8">
                        {items.map(item => {
                            if (!isMenuItemVisible(item)) return null;
                            const countData = item.countKey ? counts[item.countKey] : undefined;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        pathname.startsWith(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </div>
                                     {countData && countData.count > 0 && (
                                        <span className={cn(
                                            "rounded-full px-2 text-xs",
                                            countData.highlight ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {countData.count}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
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
          {userType === 'official' && menuItems.map(renderMenuItem)}

          {userType === 'requester' && (
              <>
                  {renderCollapsibleMenu('ipRequest', 'IP Request', FileText, ipRequestChildItems)}
                  {renderCollapsibleMenu('eOffice', 'E-Office', Briefcase, eOfficeChildItems)}
              </>
          )}

          {(userType === 'official' && adminMenuItems.some(isMenuItemVisible)) && <SidebarSeparator />}
          
          {userType === 'official' && adminMenuItems.map(renderMenuItem)}

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
