
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyApprovedRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Approved Requests</h1>
            <Card>
                <CardHeader>
                
                    <CardDescription>These requests have been approved and the IP should be active.</CardDescription>
                </CardHeader>
                <CardContent>
                     <MyRequestsListPage
                        title="Approved Requests"
                        description="These requests have been approved."
                        statusIds={[3]}
                        showFilters={false}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
