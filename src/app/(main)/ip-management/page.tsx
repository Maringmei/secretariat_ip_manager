import RequestsTable from "@/components/requests-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOCKS, DEPARTMENTS, REQUESTS } from "@/lib/data";
import { Download, Search } from "lucide-react";

export default function IPManagementPage() {
    // In a real app, filters would be stateful and trigger API calls.
    const allocatedIPs = REQUESTS.filter(r => r.status === 'Approved' || r.status === 'Completed');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">IP Management</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocated IPs</CardTitle>
          <CardDescription>Search and filter all allocated IP addresses across the secretariat.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by user, IP, MAC..." className="pl-8" />
            </div>
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Block" />
                </SelectTrigger>
                <SelectContent>
                    {BLOCKS.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button>Apply Filters</Button>
          </div>
          <RequestsTable requests={allocatedIPs} />
        </CardContent>
      </Card>
    </div>
  );
}
