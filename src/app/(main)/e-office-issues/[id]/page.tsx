
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { EofficeIssue, WorkflowStep, Status } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import IssueWorkflowTimeline from '@/components/e-office/issue-workflow-timeline';
import { AssignEngineerDialog } from '@/components/e-office/assign-engineer-dialog';
import { CloseIssueDialog } from '@/components/e-office/close-issue-dialog';
import { UpdateStatusDialog } from '@/components/e-office/update-status-dialog';
import { ReopenIssueDialog } from '@/components/e-office/reopen-issue-dialog';

export default function EOfficeIssueDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [issue, setIssue] = useState<EofficeIssue | null>(null);
    const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dialog states
    const [isAssignEngineerOpen, setIsAssignEngineerOpen] = useState(false);
    const [isCloseIssueOpen, setIsCloseIssueOpen] = useState(false);
    const [isReopenIssueOpen, setIsReopenIssueOpen] = useState(false);
    const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<Status | null>(null);

    const fetchIssueDetails = async () => {
        if (!token || !id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/e-office-issues/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success && result.data) {
                setIssue({ ...result.data, created_at: new Date(result.data.created_at).toISOString() });
            } else {
                toast({ title: "Error", description: result.message || "Could not load issue details.", variant: "destructive" });
                setIssue(null);
            }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred while fetching issue details.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWorkflow = async () => {
        if (!token || !id) return;
        try {
             const response = await fetch(`${API_BASE_URL}/e-office-issues/${id}/workflows`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                const formattedWorkflow = result.data.map((item: any) => ({
                    step: item.e_office_issue_status_name,
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
             toast({ title: "Error", description: "An unexpected error occurred while fetching workflow.", variant: "destructive" });
        }
    };
    
    const refreshData = () => {
        fetchIssueDetails();
        fetchWorkflow();
    };

    useEffect(() => {
        if (id && token) {
            refreshData();
        }
    }, [id, token]);
    
    const handleWorkflowAction = async (statusId: number, remark?: string, engineerId?: number) => {
        if (!token || !issue) return;
        setIsActionLoading(true);

        const body: Record<string, any> = {
            e_office_issue_id: issue.id,
            status_id: statusId,
            remark: remark,
        };

        if (engineerId) {
            body.engineer_user_id = engineerId;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/e-office-workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(body)
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Success", description: "Issue status updated." });
                // Close all dialogs
                setIsAssignEngineerOpen(false);
                setIsCloseIssueOpen(false);
                setIsReopenIssueOpen(false);
                setIsUpdateStatusOpen(false);
                refreshData();
            } else {
                throw new Error(result.message || "Failed to update workflow.");
            }
        } catch(error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive"});
        } finally {
            setIsActionLoading(false);
        }
    };
    
    const handleUpdateStatus = async ({ remark }: { remark?: string }) => {
        if (statusToUpdate) {
            await handleWorkflowAction(statusToUpdate.id, remark);
        }
    };
    
    const handleAssignEngineer = async ({ remark, engineerId }: { remark: string, engineerId: number }) => {
        await handleWorkflowAction(3, remark, engineerId); // Status 3 is "Assign Engineer"
    };

    const handleCloseIssue = async ({ remark }: { remark?: string }) => {
        await handleWorkflowAction(4, remark); // Status 4 is "Closed"
    };
    
    const handleReopenIssue = async ({ remark }: { remark?: string }) => {
        await handleWorkflowAction(5, remark); // Status 5 is "Re-opened"
    };

    const handleActionButtonClick = (action: 'assign' | 'close' | 'reopen' | 'progress') => {
        switch (action) {
            case 'assign':
                setIsAssignEngineerOpen(true);
                break;
            case 'close':
                setIsCloseIssueOpen(true);
                break;
            case 'reopen':
                setIsReopenIssueOpen(true);
                break;
            case 'progress':
                setStatusToUpdate({ id: 2, name: 'In Progress', foreground_color: '', background_color: '' });
                setIsUpdateStatusOpen(true);
                break;
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!issue) {
        return notFound();
    }
    
    const isOfficial = user?.type === 'official';
    const canMarkInProgress = isOfficial && issue.e_office_issue_status_id === '1';
    const canAssignEngineer = isOfficial && issue.can_assign_engineer;
    const canCloseIssue = isOfficial && issue.can_close;
    const canReopen = isOfficial && issue.e_office_issue_status_id === '4'; // Can reopen if closed


    const buttonText = isOfficial && (
        issue.e_office_issue_status_id === "1" ? "New" :
        issue.e_office_issue_status_id === "2" ? "In Progress" :
        issue.e_office_issue_status_id === "3" ? "Engineer Assigned" :
        issue.e_office_issue_status_id === "4" ? "Closed" :
        issue.e_office_issue_status_id === "5" ? "Re-opened" : ""
      );

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
                        <h1 className="font-headline text-3xl font-bold">Issue #{issue.issue_no}</h1>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Submitted on {new Date(issue.created_at).toLocaleString()}</span>
                            <Badge 
                                className="border-transparent px-2 py-0.5 text-xs"
                                style={{
                                    backgroundColor: issue.status_background_color,
                                    color: issue.status_foreground_color
                                }}
                            >
                                {issue.status_name}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                     {canReopen ? (
                         <Button onClick={() => handleActionButtonClick('reopen')} disabled={isActionLoading} variant="destructive">
                            {buttonText}
                         </Button>
                     ) : canMarkInProgress ? (
                         <Button onClick={() => handleActionButtonClick('progress')} disabled={isActionLoading}>
                              {buttonText}
                         </Button>
                     ) : canAssignEngineer ? (
                        <Button onClick={() => handleActionButtonClick('assign')} disabled={isActionLoading}>
                              {buttonText}
                        </Button>
                     ) : canCloseIssue ? (
                        <Button onClick={() => handleActionButtonClick('close')} disabled={isActionLoading}>
                             {buttonText}
                        </Button>
                     ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 ">
                <Card>
                    <CardHeader><CardTitle className="font-headline text-lg">Applicant Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {issue.first_name} {issue.last_name}</p>
                        <p><strong>Designation:</strong> {issue.designation}</p>
                        <p><strong>Department:</strong> {issue.department_name}</p>
                        <p><strong>EIN/SIN:</strong> {issue.ein_sin}</p>
                        <p><strong>Reporting Officer:</strong> {issue.reporting_officer}</p>
                        <p><strong>Email:</strong> {issue.email}</p>
                        <p><strong>WhatsApp:</strong> {issue.mobile_no}</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Issue Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Category:</strong> {issue.category_name}</p>
                        <p><strong>Block:</strong> {issue.block_name}</p>
                        <p><strong>Floor:</strong> {issue.floor_name}</p>
                        <p><strong>Section:</strong> {issue.section}</p>
                        <p><strong>Room No:</strong> {issue.room_no}</p>
                        <p><strong>Description:</strong> {issue.description}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Issue Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workflow.length > 0 ? (
                            <IssueWorkflowTimeline workflow={workflow} />
                        ) : (
                            <p className="text-muted-foreground">No workflow history available for this issue.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        
        {issue.id && (
            <AssignEngineerDialog
                isOpen={isAssignEngineerOpen}
                onClose={() => setIsAssignEngineerOpen(false)}
                onConfirm={handleAssignEngineer}
                isSubmitting={isActionLoading}
                issueId={issue.id}
            />
        )}

        <CloseIssueDialog
            isOpen={isCloseIssueOpen}
            onClose={() => setIsCloseIssueOpen(false)}
            onConfirm={handleCloseIssue}
            isSubmitting={isActionLoading}
        />
        
        <ReopenIssueDialog
            isOpen={isReopenIssueOpen}
            onClose={() => setIsReopenIssueOpen(false)}
            onConfirm={handleReopenIssue}
            isSubmitting={isActionLoading}
        />

        {statusToUpdate && (
             <UpdateStatusDialog
                isOpen={isUpdateStatusOpen}
                onClose={() => {setIsUpdateStatusOpen(false); setStatusToUpdate(null);}}
                onConfirm={handleUpdateStatus}
                isSubmitting={isActionLoading}
                statusName={statusToUpdate.name}
            />
        )}
        </>
    )
}
