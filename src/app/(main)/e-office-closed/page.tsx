
'use client';
import EofficeIssuesListPage from "@/components/e-office/issues-list-page";

export default function EofficeClosedPage() {
    return (
        <EofficeIssuesListPage
            title="Closed Issues"
            description="These issues have been resolved and closed."
            statusId={4}
        />
    );
}
