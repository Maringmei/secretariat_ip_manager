
'use client';
import RequestListPage from "@/components/request-list-page";

export default function ReopenedRequestsPage() {
    return (
        <RequestListPage
            title="Reopened Requests"
            description="These requests have been reopened and require attention."
            statusId={8}
        />
    );
}
