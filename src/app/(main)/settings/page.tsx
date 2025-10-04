import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEPARTMENTS, BLOCKS, CONNECTION_SPEEDS } from "@/lib/data";
import { Edit, PlusCircle, Trash } from "lucide-react";

const SettingsTable = ({ data, columns }: { data: any[], columns: { key: string, label: string }[] }) => (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(item => (
                    <TableRow key={item.id}>
                        {columns.map(col => <TableCell key={col.key}>{item[col.key]}</TableCell>)}
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash className="h-4 w-4" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold">Admin Settings</h1>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
      
        <Tabs defaultValue="departments">
            <TabsList>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="speeds">Connection Speeds</TabsTrigger>
            </TabsList>
            <TabsContent value="departments" className="mt-4">
                <SettingsTable data={DEPARTMENTS} columns={[{ key: 'name', label: 'Department Name' }]} />
            </TabsContent>
            <TabsContent value="blocks" className="mt-4">
                <SettingsTable data={BLOCKS} columns={[{ key: 'name', label: 'Block Name' }]} />
            </TabsContent>
            <TabsContent value="speeds" className="mt-4">
                <SettingsTable data={CONNECTION_SPEEDS} columns={[{ key: 'speed', label: 'Connection Speed' }]} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
