
'use client';
import RequestsTable from "@/components/requests-table";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface MyRequestsListPageProps {
    title: string;
    description: string;
    statusIds: number[];
    showFilters?: boolean;
}

export default function MyRequestsListPage({ title, statusIds }: MyRequestsListPageProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);

            // Create a query string for multiple status_ids
            const statusQuery = statusIds.map(id => `status_id[]=${id}`).join('&');

            try {
                // The endpoint is for the current logged-in requester, so no user ID is needed.
                // The API seems to use ip-requests with no other filters for "my requests"
                const response = await fetch(`https://iprequestapi.globizsapp.com/api/ip-requests?${statusQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    const apiRequests = result.data || [];
                    const formattedRequests: Request[] = apiRequests.map((req: any) => ({
                        ...req,
                        requestedAt: new Date(req.created_at),
                    }));
                    setRequests(formattedRequests);
                } else {
                    toast({
                        title: "Error",
                        description: result.message || `Could not load ${title.toLowerCase()}.`,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                 toast({
                    title: "Error",
                    description: `An unexpected error occurred while fetching ${title.toLowerCase()}.`,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchRequests();
    }, [token, toast, statusIds, title]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return <RequestsTable requests={requests} />;
}
