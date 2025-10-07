
'use client';
import RequestsTable from "@/components/requests-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Request, Department } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { API_BASE_URL } from "@/lib/api";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

interface RequestListPageProps {
    title: string;
    description: string;
    statusId: number;
}

interface PaginationState {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export default function RequestListPage({ title, description, statusId }: RequestListPageProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        totalCount: 0,
        pageCount: 1,
        currentPage: 1,
        perPage: 20
    });

    // Filter states
    const [searchName, setSearchName] = useState("");
    const [requestNumber, setRequestNumber] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    const fetchRequests = async (page: number, currentStatusId: number, name = "", reqNo = "", deptId = "") => {
        if (!token) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                request_no: reqNo,
                name: name,
                department_id: deptId,
                status_id: String(currentStatusId),
            });

            const response = await fetch(`${API_BASE_URL}/ip-requests?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && result.data) {
                const apiRequests = result.data.ip_requests || [];
                const formattedRequests: Request[] = apiRequests.map((req: any) => ({
                    ...req,
                    requestedAt: new Date(req.created_at),
                }));
                setRequests(formattedRequests);
                setPagination(result.data.pagination);
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
        fetchRequests(1, statusId);

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
    }, [token, toast, statusId, title]);

    const handleFilter = () => {
        fetchRequests(1, statusId, searchName, requestNumber, selectedDept);
    }
    
    const handleClearFilters = () => {
        setSearchName("");
        setRequestNumber("");
        setSelectedDept("");
        fetchRequests(1, statusId);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.pageCount) {
            fetchRequests(newPage, statusId, searchName, requestNumber, selectedDept);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">{title}</h1>
            <Card>
                <CardHeader>
                  
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
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleFilter}>Apply Filters</Button>
                        <Button onClick={handleClearFilters} variant="outline">Clear Filter</Button>
                    </div>

                    {isLoading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <RequestsTable requests={requests} />
                            {pagination && pagination.totalCount > 0 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage - 1); }} 
                                                className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <span className="px-4 text-sm">
                                                Page {pagination.currentPage} of {pagination.pageCount}
                                            </span>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext 
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage + 1); }}
                                                className={pagination.currentPage === pagination.pageCount ? 'pointer-events-none opacity-50' : ''}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
