
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReopenedRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Reopened Requests</h1>
            <Card>
                <CardHeader>
                    <CardDescription>These are your requests that have been reopened for further action.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MyRequestsListPage
                        title="Reopened Requests"
                        description="These requests have been reopened."
                        statusIds={[8]}
                        showFilters={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
