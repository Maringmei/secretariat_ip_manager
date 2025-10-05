
'use client';
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";

export default function ProfilePage() {
    const { user } = useAuth();
    // Assuming new user if profile is not complete, which we might not know from the API.
    // We can adjust this logic. For now, let's assume we always edit.
    const isNewUser = !user?.profileComplete; 

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
    </div>
  );
}
