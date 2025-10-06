
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyPendingRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Pending Requests</h1>
            <Card>
                <CardHeader>
            
                    <CardDescription>These are your requests that are currently being processed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MyRequestsListPage
                        title="Pending Requests"
                        description="These requests are new or pending approval."
                        statusIds={[1, 2]}
                        showFilters={false}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
