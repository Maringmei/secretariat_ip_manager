
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
import type { Request } from "@/lib/types";
import { useAuth } from "./auth/auth-provider";
import { useRouter } from "next/navigation";

interface RequestsTableProps {
  requests: Request[];
}

export default function RequestsTable({ requests = [] }: RequestsTableProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleRowClick = (requestId: number) => {
        router.push(`/requests/${requestId}`);
    };

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
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length > 0 ? requests.map((request) => (
          <TableRow key={request.id} onClick={() => handleRowClick(request.id)} className="cursor-pointer">
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
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No requests found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
    </div>
  );
}
