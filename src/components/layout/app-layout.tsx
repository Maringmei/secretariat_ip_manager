
'use client';

import { useAuth } from "@/components/auth/auth-provider";
import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfilePage from "@/app/(main)/profile/page";

export default function  AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNewUser, setIsNewUser] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
        const newUserFlag = localStorage.getItem('isNewUser') === 'true';
        // A user is "new" if the flag is set and their name isn't in the user object yet.
        const needsProfile = newUserFlag && !user.name;
        setIsNewUser(needsProfile);

        if (needsProfile && pathname !== '/profile') {
            router.replace('/profile');
            return;
        } else if (!needsProfile && newUserFlag) {
            // Profile has been created, clear the flag
            localStorage.removeItem('isNewUser');
        }

        // Redirect logic for officials without IP Request access
        const isOfficial = user.type === 'official';
        const userAccess = user.access || [];
        const hasIpRequestAccess = userAccess.includes('IP Request');
        const hasEofficeAccess = userAccess.includes('E-Office');

        if (isOfficial && !hasIpRequestAccess && hasEofficeAccess && !pathname.startsWith('/e-office')) {
          setShouldRedirect(true);
          router.replace('/e-office');
        } else {
          setShouldRedirect(false);
        }

    }
  }, [isAuthenticated, user, pathname, router]);


  if (isLoading || !isAuthenticated || shouldRedirect) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If new user, force them to the profile page without the main layout
  if (isNewUser) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             <main className="w-full max-w-2xl">
                <ProfilePage />
             </main>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
