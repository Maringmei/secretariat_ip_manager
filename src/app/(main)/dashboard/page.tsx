
'use client';
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Activity, ArrowUpRight, Check, Clock, Server, Users, X } from "lucide-react";
import Link from "next/link";
import DepartmentAllocationsChart from "@/components/dashboard/department-allocations-chart";
import SpeedChart from "@/components/dashboard/speed-chart";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DashboardData {
    summary?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        e_office_onboarded: number;
        e_office_not_onboarded: number;
    };
    by_connection_speed?: { connection_speed_name: string; count: number }[];
    by_department?: { block_name: string; total: number; pending: number; approved: number; rejected: number;}[];
    by_block?: { block_name: string; count: number }[];
    by_month?: { label: string; count: number }[];
    // For requester
    total?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
}


const AdminDashboard = ({ data }: { data: DashboardData }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total IPs Allocated" value={data.summary?.approved.toString() ?? '0'} icon={Server} />
                <StatsCard title="Pending Requests" value={data.summary?.pending.toString() ?? '0'} icon={Clock} />
                <StatsCard title="Departments Onboarded" value={data.by_department?.length.toString() ?? '0'} icon={Users} />
                <StatsCard title="Avg. Approval Time" value="36 Hours" icon={Activity} description="in the last 30 days" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="font-headline">Department-wise Allocations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentAllocationsChart data={data.by_department} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Connection Speed Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpeedChart data={data.by_connection_speed} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StaffDashboard = ({ data }: { data: DashboardData }) => {
    const { user } = useAuth();
    if (!user) return null;

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
                <StatsCard title="Pending" value={data.pending?.toString() ?? '0'} icon={Clock} />
                <StatsCard title="Approved" value={data.approved?.toString() ?? '0'} icon={Check} />
                <StatsCard title="Rejected" value={data.rejected?.toString() ?? '0'} icon={X} />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle className="font-headline">My Requests History</CardTitle>
                        <CardDescription>
                            An overview of all your submitted IP allocation requests.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/requests">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* The API doesn't provide recent requests, so this is empty or could fetch from another endpoint */}
                    <p className="text-sm text-muted-foreground">You can view all your requests from the "My Requests" page.</p>
                </CardContent>
            </Card>
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
                ? 'https://iprequestapi.globizsapp.com/api/dashboard'
                : 'https://iprequestapi.globizsapp.com/api/dashboard/0'; // 0 is a placeholder for current user

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
