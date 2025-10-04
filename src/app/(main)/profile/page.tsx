import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_LOGGED_IN_USER } from "@/lib/data";

export default function ProfilePage() {
    const isNewUser = !MOCK_LOGGED_IN_USER.profileComplete;
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
                <ProfileForm user={MOCK_LOGGED_IN_USER} />
            </CardContent>
        </Card>
    </div>
  );
}
