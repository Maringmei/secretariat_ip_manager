
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { EofficeIssue, Department, Status } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Combobox } from "@/components/ui/combobox";
import IssuesTable from "@/components/e-office/issues-table";

interface PaginationState {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export default function EOfficeIssuesPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [issues, setIssues] = useState<EofficeIssue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [categories, setCategories] = useState<any[]>([]); // Define a proper type if you have it
    const [pagination, setPagination] = useState<PaginationState>({
        totalCount: 0,
        pageCount: 1,
        currentPage: 1,
        perPage: 20
    });

    // Filter states
    const [issueNo, setIssueNo] = useState("");
    const [name, setName] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const fetchIssues = async (page: number, filters: Record<string, string> = {}) => {
        if (!token) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);

        const queryParams = new URLSearchParams({
            page: String(page),
            issue_no: filters.issueNo || "",
            name: filters.name || "",
            department_id: filters.departmentId || "",
            status_id: filters.statusId || "",
            category_id: filters.categoryId || "",
        });

        try {
            const response = await fetch(`${API_BASE_URL}/e-office-issues?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && result.data) {
                setIssues(result.data.issues || []);
                setPagination(result.data.pagination);
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Could not load issues.",
                    variant: "destructive",
                });
            }
        } catch (error) {
             toast({
                title: "Error",
                description: `An unexpected error occurred while fetching issues.`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchIssues(1);

        const fetchFilterData = async (url: string, setData: (data: any[]) => void) => {
            if (!token) return;
            try {
                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
                const result = await response.json();
                if (result.success) setData(result.data);
            } catch (error) { console.error("Error fetching filter data from", url, error); }
        };

        fetchFilterData(`${API_BASE_URL}/departments`, setDepartments);
        fetchFilterData(`${API_BASE_URL}/status`, setStatuses);
        fetchFilterData(`${API_BASE_URL}/categories`, setCategories);
    }, [token]);

    const handleFilter = () => {
        fetchIssues(1, {
            issueNo,
            name,
            departmentId: selectedDept,
            statusId: selectedStatus,
            categoryId: selectedCategory
        });
    }
    
    const handleClearFilters = () => {
        setIssueNo("");
        setName("");
        setSelectedDept("");
        setSelectedStatus("");
        setSelectedCategory("");
        fetchIssues(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.pageCount) {
            fetchIssues(newPage, {
                issueNo,
                name,
                departmentId: selectedDept,
                statusId: selectedStatus,
                categoryId: selectedCategory
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">E-Office Issues</h1>
            <Card>
                <CardHeader>
                    <CardDescription>A list of all E-Office related issues and their current status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
                        <Input placeholder="Search by Issue No..." value={issueNo} onChange={(e) => setIssueNo(e.target.value)} />
                        <Input placeholder="Search by name..." value={name} onChange={(e) => setName(e.target.value)} />
                         <Combobox
                            options={departments.map(d => ({ value: String(d.id), label: d.name }))}
                            value={selectedDept}
                            onChange={setSelectedDept}
                            placeholder="All Departments"
                            searchPlaceholder="Search department..."
                        />
                        <Combobox
                            options={statuses.map(s => ({ value: String(s.id), label: s.name }))}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            placeholder="All Statuses"
                            searchPlaceholder="Search status..."
                        />
                         <Combobox
                            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            placeholder="All Categories"
                            searchPlaceholder="Search category..."
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleFilter} className="w-full">Apply Filters</Button>
                            <Button onClick={handleClearFilters} variant="outline" className="w-full">Clear</Button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <IssuesTable issues={issues} />
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
