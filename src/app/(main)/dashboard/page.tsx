import { MOCK_LOGGED_IN_USER, REQUESTS, DEPARTMENTS, CONNECTION_SPEEDS } from "@/lib/data";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Activity, ArrowUpRight, Clock, Server, Users, Wifi } from "lucide-react";
import RequestsTable from "@/components/requests-table";
import Link from "next/link";
import SpeedChart from "@/components/dashboard/speed-chart";
import DepartmentAllocationsChart from "@/components/dashboard/department-allocations-chart";

const AdminDashboard = () => {
    const pendingRequests = REQUESTS.filter(r => r.status === 'Pending' || r.status === 'Pending Approval').length;
    const totalAllocated = REQUESTS.filter(r => r.status === 'Approved' || r.status === 'Completed').length;
    
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total IPs Allocated" value={totalAllocated.toString()} icon={Server} />
                <StatsCard title="Pending Requests" value={pendingRequests.toString()} icon={Clock} />
                <StatsCard title="Departments Onboarded" value={DEPARTMENTS.length.toString()} icon={Users} />
                <StatsCard title="Avg. Approval Time" value="36 Hours" icon={Activity} description="in the last 30 days" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="font-headline">Department-wise Allocations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentAllocationsChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Connection Speed Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpeedChart />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                    <CardTitle className="font-headline">Recent Requests</CardTitle>
                    <CardDescription>
                        An overview of the most recent IP allocation requests.
                    </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/ip-management">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <RequestsTable requests={REQUESTS.slice(0, 5)} />
                </CardContent>
            </Card>
        </div>
    );
};

const DirectorDashboard = () => {
    const pendingApproval = REQUESTS.filter(r => r.status === 'Pending Approval');
    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Director Dashboard</h1>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Requests Awaiting Your Approval</CardTitle>
                    <CardDescription>These requests have been assigned an IP and need final approval.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RequestsTable requests={pendingApproval} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">All Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <RequestsTable requests={REQUESTS.slice(0,10)} />
                </CardContent>
            </Card>
        </div>
    );
};

const StaffDashboard = () => {
    const user = MOCK_LOGGED_IN_USER;
    const myRequests = REQUESTS.filter(r => r.userId === user.id);

    return (
        <div className="flex flex-col gap-6">
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="font-headline">Welcome, {user.firstName}!</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Ready to get connected? Submit a new IP request here.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild variant="secondary" size="lg">
                        <Link href="/requests/new">New IP Request</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <RequestsTable requests={myRequests} />
                </CardContent>
            </Card>
        </div>
    );
};

const DashboardByRole = ({ role }: { role: Role }) => {
    switch (role) {
        case 'admin':
        case 'coordinator':
            return <AdminDashboard />;
        case 'director':
            return <DirectorDashboard />;
        case 'staff':
            return <StaffDashboard />;
        default:
            return <p>Invalid user role.</p>;
    }
};

export default function DashboardPage() {
  const userRole = MOCK_LOGGED_IN_USER.role;
  return <DashboardByRole role={userRole} />;
}
