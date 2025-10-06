
'use client';
import RequestListPage from "@/components/request-list-page";

export default function ClosedRequestsPage() {
    return (
        <RequestListPage
            title="Closed Requests"
            description="These requests have been closed."
            statusId={7}
        />
    );
}
