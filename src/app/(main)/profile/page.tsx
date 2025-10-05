
'use client';
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        if (user) {
            const newUserFlag = localStorage.getItem('isNewUser') === 'true';
            const needsProfile = newUserFlag && !user.name;
            setIsNewUser(needsProfile);
        }
    }, [user]);

    const handleBackToLogin = () => {
        logout();
        router.push('/');
    };
    
    if (!user) return null; // Or a loading state

  return (
    <div className="mx-auto max-w-2xl">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">
                    {isNewUser ? "Create Your Profile" : "Edit Your Profile"}
                </CardTitle>
                <CardDescription>
                    {isNewUser 
                        ? "Please complete your profile to continue. This information will be used for all future IP requests."
                        : "Keep your information up to date to ensure smooth processing of your requests."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm user={user} />
            </CardContent>
        </Card>
        {isNewUser && (
            <div className="mt-4 text-center">
                <Button variant="link" onClick={handleBackToLogin}>
                    Back to Login
                </Button>
            </div>
        )}
    </div>
  );
}
