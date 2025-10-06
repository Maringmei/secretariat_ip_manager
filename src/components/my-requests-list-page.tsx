
'use client';
import RequestsTable from "@/components/requests-table";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request, Department } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { API_BASE_URL } from "@/lib/api";

interface MyRequestsListPageProps {
    title: string;
    description: string;
    statusIds: number[];
    showFilters?: boolean;
}

export default function MyRequestsListPage({ title, description, statusIds, showFilters = false }: MyRequestsListPageProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Filter states
    const [searchName, setSearchName] = useState("");
    const [requestNumber, setRequestNumber] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const fetchRequests = async (name = "", reqNo = "", deptId = "") => {
        if (!token) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);

        const statusQuery = statusIds.map(id => `status_id[]=${id}`).join('&');
        
        const queryParams = new URLSearchParams({
            page: '1',
            request_no: reqNo,
            name: name,
            department_id: deptId,
        });
        
        const statusParam = statusIds.length > 0 ? statusQuery : '';

        try {
            const response = await fetch(`${API_BASE_URL}/ip-requests?${queryParams.toString()}&${statusParam}`, {
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
        fetchRequests();

        const fetchFilterData = async (url: string, setData: (data: any[]) => void) => {
            if (!token) return;
            try {
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                 console.error("Error fetching filter data from", url, error);
            }
        };

        fetchFilterData(`${API_BASE_URL}/departments`, setDepartments);
    }, [token, statusIds.join(',')]); // Depend on stringified statusIds to avoid re-fetches on array reference change

    const handleFilter = () => {
        fetchRequests(searchName, requestNumber, selectedDept);
    }
    
    const handleClearFilters = () => {
        setSearchName("");
        setRequestNumber("");
        setSelectedDept("");
        fetchRequests();
    };

    return (
        <div>
            {showFilters && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
                    <div className="relative">
                        <Label>Name</Label>
                        <Search className="absolute left-2.5 top-10 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..." 
                            className="pl-8" 
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                     <div className="relative">
                        <Label>Request No</Label>
                        <Search className="absolute left-2.5 top-10 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by request number..." 
                            className="pl-8" 
                            value={requestNumber}
                            onChange={(e) => setRequestNumber(e.target.value)}
                        />
                    </div>
                    <div>
                         <Label>Department</Label>
                         <Select value={selectedDept} onValueChange={setSelectedDept}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleFilter} className="w-full">Apply Filters</Button>
                        <Button onClick={handleClearFilters} variant="outline" className="w-full">Clear Filter</Button>
                    </div>
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
