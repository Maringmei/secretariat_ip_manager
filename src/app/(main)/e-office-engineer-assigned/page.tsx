
'use client';
import EofficeIssuesListPage from "@/components/e-office/issues-list-page";

export default function EofficeEngineerAssignedPage() {
    return (
        <EofficeIssuesListPage
            title="Engineer Assigned Issues"
            description="An engineer has been assigned to these issues."
            statusId={3}
        />
    );
}
