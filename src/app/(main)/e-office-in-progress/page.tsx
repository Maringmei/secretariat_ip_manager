
'use client';
import EofficeIssuesListPage from "@/components/e-office/issues-list-page";

export default function EofficeInProgressPage() {
    return (
        <EofficeIssuesListPage
            title="In Progress Issues"
            description="These issues are currently being worked on."
            statusId={2}
        />
    );
}
