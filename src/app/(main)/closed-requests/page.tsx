
'use client';
import RequestListPage from "@/components/request-list-page";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

export default function ClosedRequestsPage() {
    const [filters, setFilters] = useState({ name: "", reqNo: "", deptId: "" });
    const [isExporting, setIsExporting] = useState(false);
    const { token } = useAuth();
    const { toast } = useToast();

    const handleExport = async () => {
        if (!token) {
            toast({ title: 'Error', description: 'Authentication token not found.', variant: 'destructive' });
            return;
        }

        setIsExporting(true);
        try {
            const queryParams = new URLSearchParams({
                request_no: filters.reqNo,
                name: filters.name,
                department_id: filters.deptId,
                status_id: '7',
                export: '1'
            });

            const response = await fetch(`${API_BASE_URL}/ip-requests?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during export.' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'closed-requests.xlsx'; // Default filename
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({ title: 'Success', description: 'Your file has been downloaded.' });

        } catch (error: any) {
            toast({ title: 'Export Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <RequestListPage
            title="Closed Requests"
            description="These requests have been closed."
            statusId={7}
            onFiltersChange={setFilters}
            actionButton={
                <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export
                </Button>
            }
        />
    );
}
