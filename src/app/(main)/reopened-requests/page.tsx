
'use client';
import RequestListPage from "@/components/request-list-page";

export default function ReopenedRequestsPage() {
    return (
        <RequestListPage
            title="Reopened Requests"
            description="These requests have been reopened for further action."
            statusId={8}
        />
    );
}
