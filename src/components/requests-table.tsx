import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Request, RequestStatus } from "@/lib/types";
import { DEPARTMENTS, MOCK_LOGGED_IN_USER } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface RequestsTableProps {
  requests: Request[];
}

const statusColors: Record<RequestStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    Assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    "Pending Approval": "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
    Approved: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Reverted: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};


const getDepartmentName = (id: string) => {
    return DEPARTMENTS.find(d => d.id === id)?.name || "Unknown";
}


export default function RequestsTable({ requests }: RequestsTableProps) {
    const userRole = MOCK_LOGGED_IN_USER.role;

  return (
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.id}</TableCell>
            <TableCell>{request.workflow[0]?.actor || 'Unknown User'}</TableCell>
            <TableCell className="hidden md:table-cell">{getDepartmentName(request.block)}</TableCell>
            <TableCell>
              <Badge className={`border-transparent ${statusColors[request.status]}`}>{request.status}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <Link href={`/requests/${request.id}`} passHref>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </Link>
                  {(userRole === 'director' && request.status === 'Pending Approval') && <DropdownMenuItem>Approve</DropdownMenuItem>}
                  {(userRole === 'director' && request.status === 'Pending Approval') && <DropdownMenuItem className="text-destructive">Revert</DropdownMenuItem>}
                  {(userRole === 'admin' || userRole === 'coordinator') && <DropdownMenuItem>Assign IP</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
}
