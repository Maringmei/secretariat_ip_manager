import RequestsTable from "@/components/requests-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_LOGGED_IN_USER, REQUESTS } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
    const user = MOCK_LOGGED_IN_USER;
    const myRequests = REQUESTS.filter(r => r.userId === user.id);

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
                    <RequestsTable requests={myRequests} />
                </CardContent>
            </Card>
        </div>
    )
}
