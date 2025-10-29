
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EOfficePage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">E-Office</h1>
            <Card>
                <CardHeader>
                    <CardTitle>E-Office Dashboard</CardTitle>
                    <CardDescription>Welcome to the E-Office section.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is the main page for E-Office related tasks and information.</p>
                </CardContent>
            </Card>
        </div>
    );
}
