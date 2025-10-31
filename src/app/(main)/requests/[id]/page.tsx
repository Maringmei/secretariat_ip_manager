
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Request, WorkflowStep } from '@/lib/types';
import WorkflowTimeline from '@/components/workflow-timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, File, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssignIpDialog } from '@/components/requests/assign-ip-dialog';
import { useCounter } from '@/components/counter/counter-provider';
import { ApproveRequestDialog } from '@/components/requests/approve-request-dialog';
import { RejectRequestDialog } from '@/components/requests/reject-request-dialog';
import { API_BASE_URL } from '@/lib/api';
import { AssignEngineerDialog } from '@/components/requests/assign-engineer-dialog';
import { CloseRequestDialog } from '@/components/requests/close-request-dialog';
import { ReopenRequestDialog } from '@/components/requests/reopen-request-dialog';
import Link from 'next/link';

export default function RequestDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { refreshCounts } = useCounter();

    const [request, setRequest] = useState<Request | null>(null);
    const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dialog states
    const [isAssignIpOpen, setIsAssignIpOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isAssignEngineerOpen, setIsAssignEngineerOpen] = useState(false);
    const [isCloseRequestOpen, setIsCloseRequestOpen] = useState(false);
    const [isReopenRequestOpen, setIsReopenRequestOpen] = useState(false);


    const fetchRequestDetails = async () => {
        if (!token || !id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ip-requests/${id}`, {
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
             const response = await fetch(`${API_BASE_URL}/ip-requests/${id}/workflows`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                const formattedWorkflow = result.data.map((item: any) => ({
                    step: item.status_name,
                    timestamp: item.date,
                    actor: item.action_by,
                    remarks: item.remark
                }));
                setWorkflow(formattedWorkflow);
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

    const refreshData = () => {
        fetchRequestDetails();
        fetchWorkflow();
        refreshCounts();
    }

    useEffect(() => {
        if (id && token) {
            refreshData();
        }
    }, [id, token]);


    const handleWorkflowAction = async (statusId: number, remark?: string) => {
        if (!token || !request) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    ip_request_id: request.id,
                    status_id: statusId,
                    remark: remark,
                })
            });

            const result = await response.json();
            if (result.success) {
                toast({ title: "Success", description: "Request status updated." });
                // Close all dialogs
                setIsAssignIpOpen(false);
                setIsApproveOpen(false);
                setIsRejectOpen(false);
                setIsCloseRequestOpen(false);
                setIsReopenRequestOpen(false);
                refreshData();
            } else {
                throw new Error(result.message || "Failed to update workflow.");
            }

        } catch(error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive"});
        } finally {
            setIsActionLoading(false);
        }
    }

    const handleAssignIp = async (data: { ipAddressId: number; speedId: number; remark?: string }) => {
        if (!token || !request) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    ip_request_id: request.id,
                    status_id: 2, // Move from New (1) to IP Assigned (2)
                    ip_address_id: data.ipAddressId,
                    connection_speed_id: data.speedId,
                    remark: data.remark,
                })
            });

            const result = await response.json();
            if (result.success) {
                toast({ title: "Success", description: "IP address has been assigned." });
                setIsAssignIpOpen(false);
                refreshData();
            } else {
                throw new Error(result.message || "Failed to assign IP.");
            }

        } catch(error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive"});
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleApprove = async ({ remark }: { remark?: string }) => {
        await handleWorkflowAction(3, remark);
    };
    
    const handleClose = async ({ remark }: { remark?: string }) => {
        await handleWorkflowAction(7, remark);
    };

    const handleReject = async ({ remark }: { remark: string }) => {
        await handleWorkflowAction(5, remark);
    };
    
    const handleReopen = async ({ remark }: { remark?: string }) => {
        await handleWorkflowAction(8, remark);
    };

    const handleAssignEngineer = async ({ remark, engineerId }: { remark: string, engineerId: number }) => {
        if (!token || !request) return;

        setIsActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify({
                    ip_request_id: request.id,
                    status_id: 6, // Move to 'Ready'
                    remark: remark,
                    network_engineer_user_id: engineerId
                })
            });

            const result = await response.json();
            if (result.success) {
                toast({ title: "Success", description: "Network Engineer has been assigned and request is marked as Ready." });
                setIsAssignEngineerOpen(false);
                refreshData();
            } else {
                 throw new Error(result.message || "Failed to assign engineer.");
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
    
    const isOfficial = user?.type === 'official';
    const isRequester = user?.type === 'requester';
    const canAssignIp = isOfficial && request.status_id === "1";
    const canApprove = isOfficial && request.status_id === "2" && request.can_approve;
    const canReject = isOfficial && (request.status_id === "1" || request.status_id === "2") && request.can_approve;
    const canAssignEngineer = isOfficial && request.status_id === "3" && request.can_assign_network_engineer;
    const canCloseRequest = isOfficial && (request.status_id === "6" || request.status_id === "8") && request.can_close;
    const canCloseRequestByRequester = !isOfficial && (request.status_id === "6" || request.status_id === "8") && request.can_close;
    
    const isClosed = request.status_id === "7";
    const isApproved = request.status_id === "3";

    const canReopenAsOfficial = isOfficial && isClosed;
    const canReopenAsRequester = !isOfficial && isClosed;
    const canReopen = canReopenAsOfficial || canReopenAsRequester;


    return (
        <>
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-headline text-3xl font-bold">Request #{request.request_number}</h1>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Submitted on {new Date(request.requestedAt).toLocaleString()}</span>
                            <Badge 
                                className="border-transparent px-2 py-0.5 text-xs"
                                style={{
                                    backgroundColor: request.status_background_color,
                                    color: request.status_foreground_color
                                }}
                            >
                                {request.status_name}
                            </Badge>
                        </div>
                    </div>
                </div>
                 <div className="flex flex-wrap gap-4">
                    {canAssignIp && (
                        <Button onClick={() => setIsAssignIpOpen(true)} disabled={isActionLoading}>Assign IP Address</Button>
                    )}
                    {canApprove && (
                        <Button onClick={() => setIsApproveOpen(true)} disabled={isActionLoading}>Approve</Button>
                    )}
                    {canCloseRequest && (
                            <Button onClick={() => setIsCloseRequestOpen(true)} disabled={isActionLoading}>Close request</Button>
                    )}
                    {canCloseRequestByRequester && (
                            <Button onClick={() => setIsCloseRequestOpen(true)} disabled={isActionLoading}>Close request</Button>
                    )}
                    {canReject && (
                        <Button variant="destructive" onClick={() => setIsRejectOpen(true)} disabled={isActionLoading}>Reject</Button>
                    )}
                        {canAssignEngineer && (
                        <Button onClick={() => setIsAssignEngineerOpen(true)} disabled={isActionLoading}>Assign Network Engineer</Button>
                    )}
                    {canReopen && (
                        <Button onClick={() => setIsReopenRequestOpen(true)} disabled={isActionLoading}>Reopen</Button>
                    )}
                
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 ">
                {request.service_time_label && request.service_time && (
                     <Card className="bg-white border-blue-200">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Timer className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="font-semibold text-blue-800">{request.service_time_label}</p>
                                <p className="text-xl font-bold text-blue-900">{request.service_time}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Applicant Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {request.first_name} {request.last_name}</p>
                        <p><strong>Designation:</strong> {request.designation}</p>
                        <p><strong>Department:</strong> {request.department_name}</p>
                        {request.ein_sin ? (
                            <p><strong>EIN/SIN:</strong> {request.ein_sin}</p>
                        ) : (
                            <p><strong>ID Card No:</strong> {request.id_card_no}</p>
                        )}
                        <p><strong>Reporting Officer:</strong> {request.reporting_officer}</p>
                        <p><strong>Email:</strong> {request.email}</p>
                        <p><strong>WhatsApp:</strong> {request.mobile_no}</p>
                    </CardContent>
                </Card>
                
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
                
                {request.id_card_file && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Attachments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                                <div className='flex items-center'>
                                    <File className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <Link href={request.id_card_file} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                        View ID Card
                                    </Link>
                                </div>
                        </CardContent>
                    </Card>
                )}


                <Card>
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
            </div>
        </div>
        
        {canAssignIp && (
            <AssignIpDialog
                isOpen={isAssignIpOpen}
                onClose={() => setIsAssignIpOpen(false)}
                onConfirm={handleAssignIp}
                isSubmitting={isActionLoading}
                requestId={Number(id)}
            />
        )}
        
        <ApproveRequestDialog
            isOpen={isApproveOpen}
            onClose={() => setIsApproveOpen(false)}
            onConfirm={handleApprove}
            isSubmitting={isActionLoading}
        />
        <RejectRequestDialog
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            onConfirm={handleReject}
            isSubmitting={isActionLoading}
        />
            <CloseRequestDialog
            isOpen={isCloseRequestOpen}
            onClose={() => setIsCloseRequestOpen(false)}
            onConfirm={handleClose}
            isSubmitting={isActionLoading}
        />
        
        {canAssignEngineer && request && (
            <AssignEngineerDialog
                isOpen={isAssignEngineerOpen}
                onClose={() => setIsAssignEngineerOpen(false)}
                onConfirm={handleAssignEngineer}
                isSubmitting={isActionLoading}
                requestId={request.id}
            />
        )}
        {canReopen && (
            <ReopenRequestDialog
                isOpen={isReopenRequestOpen}
                onClose={() => setIsReopenRequestOpen(false)}
                onConfirm={handleReopen}
                isSubmitting={isActionLoading}
            />
        )}
        </>
    )
}
