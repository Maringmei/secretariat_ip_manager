
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { EofficeIssue } from "@/lib/types";
import { useRouter } from "next/navigation";

interface IssuesTableProps {
  issues: EofficeIssue[];
}

export default function IssuesTable({ issues = [] }: IssuesTableProps) {
    const router = useRouter();
    
    const handleRowClick = (issueId: string) => {
        router.push(`/e-office-issues/${issueId}`);
    };

  return (
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issue No</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.length > 0 ? issues.map((issue) => (
          <TableRow key={issue.id} onClick={() => handleRowClick(issue.id)} className="cursor-pointer">
            <TableCell className="font-medium">{issue.issue_no}</TableCell>
            <TableCell>{`${issue.first_name} ${issue.last_name || ''}`}</TableCell>
            <TableCell className="hidden md:table-cell">{issue.category_name}</TableCell>
            <TableCell>
              <Badge 
                className={`border-transparent`}
                style={{
                  backgroundColor: issue.status_background_color,
                  color: issue.status_foreground_color
                }}
              >
                {issue.status_name}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{new Date(issue.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No issues found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
