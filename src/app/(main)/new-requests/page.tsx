'use client';
import RequestsTable from "@/components/requests-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function NewRequestsPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchRequests = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const response = await fetch('https://iprequestapi.globizsapp.com/api/ip-requests?page=1&request_no=&name=&department_id=&status_id=1', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    // The API returns a paginated response, we need to extract the data array
                    setRequests(result.data.data);
                } else {
                    toast({
                        title: "Error",
                        description: "Could not load new requests.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                 toast({
                    title: "Error",
                    description: "An unexpected error occurred while fetching requests.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [token, toast]);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">New IP Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Review</CardTitle>
                    <CardDescription>These requests are new and need to be assigned an IP address.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <RequestsTable requests={requests} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
