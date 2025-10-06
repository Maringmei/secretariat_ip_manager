
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import MyRequestsListPage from "@/components/my-requests-list-page";

export default function MyRequestsPage() {
    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold">My Requests</h1>
                <Button asChild>
                    <Link href="/requests/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Request
                    </Link>
                </Button>
            </div>
            <Card>
                 <CardHeader>
                    <CardTitle>Request History</CardTitle>
                    <CardDescription>A log of all your submitted IP address requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MyRequestsListPage title="All My Requests" description="A complete history of all your requests." statusIds={[]} showFilters={true} />
                </CardContent>
            </Card>
        </div>
    )
}
