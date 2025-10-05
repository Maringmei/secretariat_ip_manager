
'use client';
import RequestListPage from "@/components/request-list-page";

export default function NewRequestsPage() {
    return (
        <RequestListPage
            title="New IP Requests"
            description="These requests are new and need to be assigned an IP address."
            statusId={1}
        />
    );
}
