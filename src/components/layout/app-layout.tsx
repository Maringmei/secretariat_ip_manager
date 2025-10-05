'use client';

import { useAuth } from "@/components/auth/auth-provider";
import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

export default function  AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // This effect runs on the client after hydration
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    if (isAuthenticated && isNewUser) {
        // We use user?.name to see if the profile has been created in this session.
        // If the user refreshes on the profile page, `user` will be updated by the AuthProvider
        // but `isNewUser` will still be true in localStorage.
        if (!user?.name) {
             setShowProfileDialog(true);
        } else {
            // Profile has been created, clear the flag
            localStorage.removeItem('isNewUser');
            setShowProfileDialog(false);
        }
    }
  }, [isAuthenticated, user]);


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

      <AlertDialog open={showProfileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome! Let's set up your profile.</AlertDialogTitle>
            <AlertDialogDescription>
              To get started, we need a few more details from you. Please complete your profile to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
            <AlertDialogAction asChild>
                <Link href="/profile">Go to Profile</Link>
            </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  );
}
