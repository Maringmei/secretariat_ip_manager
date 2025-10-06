
'use client';
import RequestsTable from "@/components/requests-table";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface MyRequestsListPageProps {
    title: string;
    description: string;
    statusIds: number[];
    showFilters?: boolean;
}

export default function MyRequestsListPage({ title, statusIds, showFilters = true }: MyRequestsListPageProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [requestNumber, setRequestNumber] = useState("");

    const fetchRequests = async (reqNo = "") => {
        if (!token) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);

        const statusQuery = statusIds.map(id => `status_id[]=${id}`).join('&');
        const requestNoQuery = reqNo ? `&request_no=${reqNo}` : '';

        try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/ip-requests?${statusQuery}${requestNoQuery}`, {
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
    
    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [token, statusIds.join(',')]); // Depend on stringified statusIds to avoid re-fetches on array reference change

    const handleFilter = () => {
        fetchRequests(requestNumber);
    }
    
    const handleClearFilters = () => {
        setRequestNumber("");
        fetchRequests();
    };

    return (
        <div>
            {showFilters && (
                <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by request number..." 
                            className="pl-8" 
                            value={requestNumber}
                            onChange={(e) => setRequestNumber(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleFilter}>Apply Filter</Button>
                    <Button onClick={handleClearFilters} variant="outline">Clear Filter</Button>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <RequestsTable requests={requests} />
            )}
        </div>
    );
}
