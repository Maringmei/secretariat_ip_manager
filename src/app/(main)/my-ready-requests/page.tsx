
'use client';
import MyRequestsListPage from "@/components/my-requests-list-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyReadyRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Ready Requests</h1>
            <Card>
                <CardHeader>
                    <CardDescription>These requests are ready for use.</CardDescription>
                </CardHeader>
                <CardContent>
                     <MyRequestsListPage
                        title="Ready Requests"
                        description="These requests are ready for use."
                        statusIds={[6]}
                        showFilters={true