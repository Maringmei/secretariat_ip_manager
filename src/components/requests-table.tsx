
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
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "./auth/auth-provider";

interface RequestsTableProps {
  requests: Request[];
}

export default function RequestsTable({ requests = [] }: RequestsTableProps) {
    const { user } = useAuth();
    const userRole = user?.type === 'official' ? user.role : 'staff';

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
            <TableCell className="font-medium">{request.request_number || request.id}</TableCell>
            <TableCell>{request.first_name ? `${request.first_name} ${request.last_name || ''}` : (request.workflow && request.workflow[0]?.actor) || 'Unknown User'}</TableCell>
            <TableCell className="hidden md:table-cell">{request.department_name || 'N/A'}</TableCell>
            <TableCell>
              <Badge 
                className={`border-transparent`}
                style={{
                  backgroundColor: request.status_background_color,
                  color: request.status_foreground_color
                }}
              >
                {request.status_name || request.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{new Date(request.requestedAt || request.created_at).toLocaleDateString()}</TableCell>
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
