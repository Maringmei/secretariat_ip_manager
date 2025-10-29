
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EOfficePendingRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">E-Office Pending Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>These are your pending requests related to E-Office.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>A list of pending E-Office requests will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
