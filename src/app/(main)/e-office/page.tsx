
'use client';
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Check, Clock, FileText, Server, Users, X, Activity, BarChart2, Inbox, CheckCheck, Archive, History, Ticket, Wrench, ShieldCheck, ShieldClose, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import DepartmentIssuesTable from "@/components/e-office/dashboard/department-issues-table";
import CategoryDistributionChart from "@/components/e-office/dashboard/category-distribution-chart";
import MonthlyIssuesChart from "@/components/e-office/dashboard/monthly-issues-chart";

interface EOfficeDashboardData {
    summary?: {
        total: number;
        new?: number;
        in_progress?: number;
        engineer_assigned?: number;
        closed?: number;
        re_opened?: number;
    };
    by_category?: { e_office_issue_category_name: string; count: number | string }[];
    by_department?: { block_name: string; total: number | string; pending: number; approved: number; }[];
    by_month?: { label: string; count: number | string }[];
    
    // For requester
    total?: number;
    new?: number;
    in_progress?: number;
    engineer_assigned?: number;
    closed?: number;
    re_opened?: number;
}


const OfficialDashboard = ({ data }: { data: EOfficeDashboardData }) => {
    const summary = data.summary || { total: 0, new: 0, in_progress: 0, engineer_assigned: 0, closed: 0, re_opened: 0 };
    return (
        <div className="flex flex-col gap-6">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <BarChart2 className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-3xl">E-Office Dashboard</CardTitle>
                            <CardDescription>Real-time overview of E-Office issue status</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatsCard title="Total" value={summary.total.toString()} icon={Ticket} />
                <Link href={"/e-office-issues"}><StatsCard title="New" value={(summary.new ?? 0).toString()} icon={Inbox}/></Link>
                <Link href={"/e-office-in-progress"}><StatsCard title="In Progress" value={(summary.in_progress ?? 0).toString()} icon={Wrench} /></Link>
                <Link href={"/e-office-engineer-assigned"}><StatsCard title="Engineer Assigned" value={(summary.engineer_assigned ?? 0).toString()} icon={Users} /></Link>
                <Link href={"/e-office-closed"}><StatsCard title="Closed" value={(summary.closed ?? 0).toString()} icon={ShieldCheck} /></Link>
                <Link href={"/e-office-reopened"}><StatsCard title="Re-opened" value={(summary.re_opened ?? 0).toString()} icon={ShieldClose} /></Link>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Issues by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryDistributionChart data={data.by_category} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Monthly Issue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyIssuesChart data={data.by_month} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Issues by Department</CardTitle>
                </CardHeader>
                <CardContent>
                    <DepartmentIssuesTable data={data.by_department} />
                </CardContent>
            </Card>
        </div>
    );
};

const RequesterDashboard = ({ data }: { data: EOfficeDashboardData }) => {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">E-Office Dashboard</h1>
                    <p className="text-muted-foreground">Here's a summary of your E-Office issues.</p>
                </div>
                <Button asChild>
                    <Link href="/e-office-issues/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Issue
                    </Link>
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatsCard title="Total Issues" value={data.total?.toString() ?? '0'} icon={Ticket} />
                <Link href={"/e-office-issues"}> <StatsCard title="New" value={data.new?.toString() ?? '0'} icon={Inbox} /> </Link>
                <Link href={"/e-office-in-progress"}> <StatsCard title="In Progress" value={data.in_progress?.toString() ?? '0'} icon={Wrench} /> </Link>
                <Link href={"/e-office-engineer-assigned"}><StatsCard title="Engineer Assigned" value={(data.engineer_assigned ?? 0).toString()} icon={Users} /></Link>
                <Link href={"/e-office-closed"}><StatsCard title="Closed" value={(data.closed ?? 0).toString()} icon={ShieldCheck} /></Link>
                <Link href={"/e-office-reopened"}><StatsCard title="Re-opened" value={(data.re_opened ?? 0).toString()} icon={ShieldClose} /></Link>
            </div>
        </div>
    );
};

const DashboardByRole = ({ role, data }: { role: string, data: EOfficeDashboardData }) => {
    switch (role) {
        case 'official':
            return <OfficialDashboard data={data} />;
        case 'requester':
            return <RequesterDashboard data={data} />;
        default:
            return <p>Invalid user role.</p>;
    }
};

export default function EOfficeDashboardPage() {
    const { user, token } = useAuth();
    const [data, setData] = useState<EOfficeDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    if (!user) return null;
    
    const userType = user?.type || 'requester';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            const url = userType === 'official' 
                ? `${API_BASE_URL}/e-office-dashboard`
                : `${API_BASE_URL}/e-office-dashboard/0`;

            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    throw new Error(result.message || "Failed to load e-office dashboard data.");
                }
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Could not fetch e-office dashboard data.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, userType, toast]);


    if (isLoading || !data) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return <DashboardByRole role={userType} data={data} />;
}
