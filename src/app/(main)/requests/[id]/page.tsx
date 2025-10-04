import WorkflowTimeline from "@/components/workflow-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEPARTMENTS, MOCK_LOGGED_IN_USER, REQUESTS, BLOCKS, CONNECTION_SPEEDS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { RequestStatus } from "@/lib/types";

const statusColors: Record<RequestStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    Assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    "Pending Approval": "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Reverted: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
    const request = REQUESTS.find(r => r.id === params.id);
    const user = MOCK_LOGGED_IN_USER; // In a real app, you'd fetch the user associated with the request.

    if (!request) {
        return <p>Request not found.</p>;
    }
    
    const departmentName = DEPARTMENTS.find(d => d.id === user.department)?.name;
    const blockName = BLOCKS.find(b => b.id === request.block)?.name;
    const speed = CONNECTION_SPEEDS.find(s => s.id === request.connectionSpeed)?.speed;


    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Request {request.id}</h1>
                    <p className="text-muted-foreground">Submitted on {new Date(request.requestedAt).toLocaleString()}</p>
                </div>
                <Badge className={`border-transparent px-4 py-2 text-base ${statusColors[request.status]}`}>{request.status}</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="font-headline">Request Workflow</CardTitle></CardHeader>
                    <CardContent>
                        <WorkflowTimeline workflow={request.workflow} />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Request Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>MAC Address:</strong> <span className="font-mono">{request.macAddress}</span></p>
                            <p><strong>Room No:</strong> {request.roomNo}</p>
                            <p><strong>Block:</strong> {blockName}</p>
                            <p><strong>Assigned IP:</strong> <span className="font-mono">{request.privateIp || 'N/A'}</span></p>
                            <p><strong>Speed:</strong> {speed || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Applicant Information</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong>Designation:</strong> {user.designation}</p>
                            <p><strong>Department:</strong> {departmentName}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>WhatsApp:</strong> {user.whatsappNo}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
