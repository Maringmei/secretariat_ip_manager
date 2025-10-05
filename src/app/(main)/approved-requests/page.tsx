
'use client';
import RequestListPage from "@/components/request-list-page";

export default function ApprovedRequestsPage() {
    return (
        <RequestListPage
            title="Approved Requests"
            description="These requests have been approved and are active."
            statusId={3}
        />
    );
}
