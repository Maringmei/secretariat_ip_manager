
'use client';
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Check, Clock, FileText, Server, Users, X, Activity, BarChart2, Inbox, CheckCheck, Archive, History } from "lucide-react";
import Link from "next/link";
import SpeedChart from "@/components/dashboard/speed-chart";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import BlockDistributionChart from "@/components/dashboard/block-distribution-chart";
import MonthlyRequestsChart from "@/components/dashboard/monthly-requests-chart";
import { API_BASE_URL } from "@/lib/api";
import StatusOverviewChart from "@/components/dashboard/status-overview-chart";
import DepartmentAllocationsTable from "@/components/dashboard/department-allocations-table";

interface DashboardData {
    summary?: {
        total: number;
        new?: number;
        pending_approval?: number;
        approved: number;
        ready?: number;
        closed?: number;
        re_opened?: number;
        rejected: number;
        e_office_onboarded: number;
        e_office_not_onboarded: number;
    };
    by_connection_speed?: { connection_speed_name: string; count: number | string }[];
    by_department?: { block_name: string; total: number | string; pending: number; approved: number; rejected: number;}[];
    by_block?: { block_name: string; count: number | string }[];
    by_month?: { label: string; count: number | string }[];
    
    // For requester
    total?: number;
    new?: number;
    pending?: number;
    pending_approval?: number;
    approved?: number;
    ready?: number;
    closed?: number;
    re_opened?: number;
    rejected?: number;
}


const AdminDashboard = ({ data }: { data: DashboardData }) => {
    const summary = data.summary || { total: 0, new: 0, pending_approval: 0, approved: 0, ready: 0, closed: 0, re_opened: 0, rejected: 0, e_office_onboarded: 0, e_office_not_onboarded: 0 };
    return (
        <div className="flex flex-col gap-6">
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <BarChart2 className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-3xl">Dashboard Analytics</CardTitle>
                            <CardDescription>Real-time overview of IP request status</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <StatsCard title="Total" value={summary.total.toString()} icon={Server} />
                <Link href={"/new-requests"}><StatsCard title="New" value={(summary.new ?? 0).toString()} icon={Inbox}/></Link>
                <Link href={"/pending-approval"}><StatsCard title="Pending Approval" value={(summary.pending_approval ?? 0).toString()} icon={Clock} /></Link>
                <Link href={"/approved-requests"}><StatsCard title="Approved" value={summary.approved.toString()} icon={FileText} /></Link>
                <Link href={"/ready-requests"}><StatsCard title="Ready" value={(summary.ready ?? 0).toString()} icon={CheckCheck} /></Link>
                <Link href={"/closed-requests"}><StatsCard title="Closed" value={(summary.closed ?? 0).toString()} icon={Archive} /></Link>
                <Link href={"/reopened-requests"}><StatsCard title="Re-opened" value={(summary.re_opened ?? 0).toString()} icon={History} /></Link>
                <Link href={"/rejected-requests"}><StatsCard title="Rejected" value={summary.rejected.toString()} icon={X} /></Link>
                <StatsCard title="e-Office Onboarded" value={summary.e_office_onboarded.toString()} icon={Users}/>
                <StatsCard title="Not Onboarded" value={summary.e_office_not_onboarded.toString()} icon={Users} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Connection Speed Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpeedChart data={data.by_connection_speed} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Requests by Block</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BlockDistributionChart data={data.by_block} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Monthly Request Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyRequestsChart data={data.by_month} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatusOverviewChart data={summary} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Department Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DepartmentAllocationsTable data={data.by_department} />
                </CardContent>
            </Card>
        </div>
    );
};

const StaffDashboard = ({ data }: { data: DashboardData }) => {
    const { user } = useAuth();
    if (!user) return null;

    const pendingCount = (data.pending ?? 0) ;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Welcome, {user.name}!</h1>
                    <p className="text-muted-foreground">Here's a summary of your IP requests.</p>
                </div>
                <Button asChild variant="default" size="lg">
                    <Link href="/requests/new">New IP Request</Link>
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Requests" value={data.total?.toString() ?? '0'} icon={Server} />
                <Link href={"/my-pending-requests"}> <StatsCard title="Pending" value={pendingCount.toString()} icon={Clock} /> </Link>
                <Link href={"/my-approved-requests"}> <StatsCard title="Approved" value={data.approved?.toString() ?? '0'} icon={Check} /> </Link>
                <Link href={"/my-ready-requests"}><StatsCard title="Ready" value={(data.ready ?? 0).toString()} icon={CheckCheck} /></Link>
                <Link href={"/my-closed-requests"}><StatsCard title="Closed" value={(data.closed ?? 0).toString()} icon={Archive} /></Link>
                <Link href={"/reopened-requests"}><StatsCard title="Re-opened" value={(data.re_opened ?? 0).toString()} icon={History} /></Link>
                <Link href={"/my-rejected-requests"}>  <StatsCard title="Rejected" value={data.rejected?.toString() ?? '0'} icon={X} /></Link>
            </div>
        </div>
    );
};

const DashboardByRole = ({ role, data }: { role: Role, data: DashboardData }) => {
    switch (role) {
        case 'admin':
        case 'coordinator':
        case 'director':
            return <AdminDashboard data={data} />;
        case 'staff':
            return <StaffDashboard data={data} />;
        default:
            return <p>Invalid user role.</p>;
    }
};

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    if (!user) return null;
    
    // A bit of a hack to map API type to internal Role type
    const userRole: Role = user?.type === 'official' ? (user.role || 'admin') : 'staff';
    const isOfficial = userRole !== 'staff';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            const url = isOfficial 
                ? `${API_BASE_URL}/dashboard`
                : `${API_BASE_URL}/dashboard/0`; // 0 is a placeholder for current user

            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    throw new Error(result.message || "Failed to load dashboard data.");
                }
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Could not fetch dashboard data.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, isOfficial, toast]);


    if (isLoading || !data) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return <DashboardByRole role={userRole} data={data} />;
}
