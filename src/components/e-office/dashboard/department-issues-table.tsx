
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DepartmentIssuesTableProps {
    data?: { block_name: string; total: number | string; pending: number; approved: number; }[];
}

export default function DepartmentIssuesTable({ data }: DepartmentIssuesTableProps) {
    if (!data || data.length === 0) {
        return <div className="flex h-[200px] items-center justify-center text-muted-foreground">No department data available</div>;
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Block Name</TableHead>
                        <TableHead className="text-center">Total Issues</TableHead>
                        <TableHead className="text-center">Pending</TableHead>
                        <TableHead className="text-center">Resolved</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((dept, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{dept.block_name}</TableCell>
                            <TableCell className="text-center font-bold">{dept.total}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{dept.pending}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">{dept.approved}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
