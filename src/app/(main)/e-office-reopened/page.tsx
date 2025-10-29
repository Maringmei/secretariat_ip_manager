
'use client';
import EofficeIssuesListPage from "@/components/e-office/issues-list-page";

export default function EofficeReopenedPage() {
    return (
        <EofficeIssuesListPage
            title="Re-opened Issues"
            description="These issues were previously closed and have been re-opened."
            statusId={5}
        />
    );
}
