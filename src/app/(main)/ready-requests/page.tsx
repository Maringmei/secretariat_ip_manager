
'use client';
import RequestListPage from "@/components/request-list-page";

export default function ReadyRequestsPage() {
    return (
        <RequestListPage
            title="Ready Requests"
            description="These requests are ready for use."
            statusId={6}
        />
    );
}
