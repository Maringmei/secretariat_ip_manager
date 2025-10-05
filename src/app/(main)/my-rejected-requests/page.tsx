
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyRejectedRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Rejected Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Rejected Requests</CardTitle>
                    <CardDescription>These requests have been rejected.</CardDescription>
                </CardHeader>
                <CardContent>
                     <MyRequestsListPage
                        title="Rejected Requests"
                        description="These requests have been rejected."
                        statusIds={[5]}
                        showFilters={false}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
