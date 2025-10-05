
'use client';
import RequestListPage from "@/components/request-list-page";

export default function RejectedRequestsPage() {
    return (
        <RequestListPage
            title="Rejected Requests"
            description="These requests have been rejected or reverted by an approver."
            statusId={5}
        />
    );
}
