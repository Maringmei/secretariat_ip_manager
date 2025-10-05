
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Request, WorkflowStep } from '@/lib/types';
import WorkflowTimeline from '@/components/workflow-timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssignIpDialog } from '@/components/requests/assign-ip-dialog';
import { useCounter } from '@/components/counter/counter-provider';

export default function RequestDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { refreshCounts } = useCounter();

    const [request, setRequest] = useState<Request | null>(null);
    const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignIpOpen, setIsAssignIpOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);


    const fetchRequestDetails = async () => {
        if (!token || !id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/ip-requests/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && result.data) {
                setRequest({ ...result.data, requestedAt: new Date(result.data.created_at) });
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Could not load request details.",
                    variant: "destructive",
                });
                setRequest(null);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred while fetching request details.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorkflow = async () => {
        if (!token || !id) return;
        try {
             const response = await fetch(`https://iprequestapi.globizsapp.com/api/ip-requests/${id}/workflows`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setWorkflow(result.data);
            } else {
                setWorkflow([]);
                console.warn("Could not load workflow or workflow is empty.");
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "An unexpected error occurred while fetching workflow.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchRequestDetails();
        fetchWorkflow();
    }, [id, token]);


    const handleAssignIp = async (data: { ipAddress: string; speedId: number; remark?: string }) => {
        if (!token || !request) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    ip_request_id: request.id,
                    status_id: 2, // Move from New (1) to IP Assigned (2)
                    ip_address: data.ipAddress,
                    connection_speed_id: data.speedId,
                    remark: data.remark,
                })
            });

            const result = await response.json();
            if (result.success) {
                toast({ title: "Success", description: "IP address has been assigned." });
                setIsAssignIpOpen(false);
                // Refresh data
                fetchRequestDetails();
                fetchWorkflow();
                refreshCounts();
            } else {
                throw new Error(result.message || "Failed to assign IP.");
            }

        } catch(error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive"});
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!request) {
        return notFound();
    }

    const canAssignIp = request.status_id === 1;

    return (
        <>
        <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Request #{request.request_number}</h1>
                    <p className="text-muted-foreground">Submitted on {new Date(request.requestedAt).toLocaleString()}</p>
                </div>
                <Badge 
                    className="border-transparent px-4 py-2 text-base"
                    style={{
                        backgroundColor: request.status_background_color,
                        color: request.status_foreground_color
                    }}
                >
                    {request.status_name}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Request Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workflow.length > 0 ? (
                            <WorkflowTimeline workflow={workflow} />
                        ) : (
                            <p className="text-muted-foreground">No workflow history available for this request.</p>
                        )}
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Request Details</CardTitle>
                            <CardDescription>
                                e-Office Onboarded: {request.e_office_onboarded === '1' ? 'Yes' : 'No'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>MAC Address:</strong> <span className="font-mono">{request.mac_address}</span></p>
                            <p><strong>Room No:</strong> {request.room_no}</p>
                             <p><strong>Section:</strong> {request.section}</p>
                            <p><strong>Block:</strong> {request.block_name}</p>
                            <p><strong>Assigned IP:</strong> <span className="font-mono">{request.ip_address || 'N/A'}</span></p>
                            <p><strong>Speed:</strong> {request.connection_speed || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="font-headline text-lg">Applicant Information</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {request.first_name} {request.last_name}</p>
                            <p><strong>Designation:</strong> {request.designation}</p>
                            <p><strong>Department:</strong> {request.department_name}</p>
                            <p><strong>EIN/SIN:</strong> {request.ein_sin}</p>
                            <p><strong>Reporting Officer:</strong> {request.reporting_officer}</p>
                            <p><strong>Email:</strong> {request.email}</p>
                            <p><strong>WhatsApp:</strong> {request.mobile_no}</p>
                        </CardContent>
                    </Card>
                    {(canAssignIp || request.can_approve) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">Actions</CardTitle>
                            </CardHeader>
                             <CardContent className="flex gap-4">
                                {canAssignIp && (
                                     <Button onClick={() => setIsAssignIpOpen(true)}>Assign IP Address</Button>
                                )}
                                {request.can_approve && (
                                    <>
                                        <Button>Approve</Button>
                                        <Button variant="destructive">Revert</Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
        
        {canAssignIp && (
            <AssignIpDialog
                isOpen={isAssignIpOpen}
                onClose={() => setIsAssignIpOpen(false)}
                onConfirm={handleAssignIp}
                isSubmitting={isActionLoading}
            />
        )}
        </>
    )
}
