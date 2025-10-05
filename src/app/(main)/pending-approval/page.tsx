
'use client';
import RequestListPage from "@/components/request-list-page";

export default function PendingApprovalPage() {
    return (
        <RequestListPage
            title="Pending Approval"
            description="These requests have been assigned an IP and need final approval."
            statusId={2}
        />
    );
}
