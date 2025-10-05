
'use client';
import RequestsTable from "@/components/requests-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request, Department, Block } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

interface RequestListPageProps {
    title: string;
    description: string;
    statusId: number;
}

export default function RequestListPage({ title, description, statusId }: RequestListPageProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);

    // Filter states
    const [searchName, setSearchName] = useState("");
    const [requestNumber, setRequestNumber] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedBlock, setSelectedBlock] = useState("");

    const fetchRequests = async (currentStatusId: number, name = "", reqNo = "", deptId = "") => {
        if (!token) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);
        try {
            // Block filter is not supported by API, so it will be client side if needed.
            // For now, we only filter by what the API supports: name/request_no and department_id
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/ip-requests?page=1&request_no=${reqNo}&name=${name}&department_id=${deptId}&status_id=${currentStatusId}`, {
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
        fetchRequests(statusId);

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

        fetchFilterData('https://iprequestapi.globizsapp.com/api/departments', setDepartments);
        fetchFilterData('https://iprequestapi.globizsapp.com/api/blocks', setBlocks);
    }, [token, toast, statusId]);

    const handleFilter = () => {
        fetchRequests(statusId, searchName, requestNumber, selectedDept);
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">{title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name..." 
                                className="pl-8" 
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by request number..." 
                                className="pl-8" 
                                value={requestNumber}
                                onChange={(e) => setRequestNumber(e.target.value)}
                            />
                        </div>
                        <Select value={selectedDept} onValueChange={setSelectedDept}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by Block" />
                            </SelectTrigger>
                            <SelectContent>
                                 <SelectItem value="">All Blocks</SelectItem>
                                {blocks.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleFilter}>Apply Filters</Button>
                    </div>

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
