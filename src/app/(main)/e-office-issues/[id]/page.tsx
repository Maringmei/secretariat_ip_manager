'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { EofficeIssue, WorkflowStep } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import IssueWorkflowTimeline from '@/components/e-office/issue-workflow-timeline';


export default function EOfficeIssueDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [issue, setIssue] = useState<EofficeIssue | null>(null);
    const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (id && token) {
            fetchIssueDetails();
            fetchWorkflow();
        }
    }, [id, token]);


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
                    {/* Action buttons will go here */}
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
        </>
    )
}
