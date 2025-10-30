

'use client';

import EofficeIssuesListPage from "@/components/e-office/issues-list-page";

export default function EOfficeIssuesPage() {
    return (
        <EofficeIssuesListPage
            title="New Issues"
            description="These issues are new and have not been assigned."
            statusId={1}
        />
    );
}
