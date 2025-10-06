
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReopenedRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Closed Requests</h1>
            <Card>
                <CardHeader>
                    <CardDescription>These are your requests that have been closed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MyRequestsListPage
                        title="Closed Requests"
                        description="These requests have been closed."
                        statusIds={[7]}
                        showFilters={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
