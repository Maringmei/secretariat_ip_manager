'use client';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';
import { ManipurEmblem } from '@/components/icons/manipur-emblem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="flex items-center gap-4 text-left">
            <ManipurEmblem className="text-primary" width={60} height={60} />
            <div>
              <h1 className="font-headline text-xl font-bold text-primary">
                  Critical Infrastructure Portal, Government of Manipur
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                  Streamlining IP Address Requests and Allocation
              </p>
            </div>
        </div>

        <Card className="mt-8 w-full shadow-xl">
            <CardHeader>
            <CardTitle className="font-headline text-xl">Secure Login</CardTitle>
            <CardDescription>
                Enter your mobile number to receive a One-Time Password (OTP).
            </CardDescription>
            </CardHeader>
            <CardContent>
            <LoginForm />
            </CardContent>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Government of Manipur. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
