
'use client';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import type { Department, Block, ConnectionSpeed } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";
import { AddSettingDialog } from "@/components/settings/add-setting-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type SettingType = 'departments' | 'blocks' | 'speeds';

const SettingsTable = ({ data, columns, onEdit, onDelete }: { data: any[], columns: { key: string, label: string }[], onEdit: (item: any) => void, onDelete: (item: any) => void }) => (
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
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item)}><Trash className="h-4 w-4" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export default function SettingsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [speeds, setSpeeds] = useState<ConnectionSpeed[]>([]);
    const [isLoading, setIsLoading] = useState<Record<SettingType, boolean>>({ departments: true, blocks: true, speeds: true });
    
    const [activeTab, setActiveTab] = useState<SettingType>('departments');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { token } = useAuth();
    const { toast } = useToast();

    const fetchData = async (type: SettingType) => {
        if (!token) return;
        
        const endpointMap: Record<SettingType, string> = {
            departments: 'https://iprequestapi.globizsapp.com/api/departments',
            blocks: 'https://iprequestapi.globizsapp.com/api/blocks',
            speeds: 'https://iprequestapi.globizsapp.com/api/connectionspeeds',
        };
        const setterMap: Record<SettingType, (data: any[]) => void> = {
            departments: setDepartments,
            blocks: setBlocks,
            speeds: setSpeeds,
        };
        
        setIsLoading(prev => ({...prev, [type]: true}));
        try {
            const response = await fetch(endpointMap[type], {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setterMap[type](result.data);
            } else {
                toast({ title: `Error fetching ${type}`, description: result.message || 'Failed to fetch data.', variant: 'destructive'});
            }
        } catch (error: any) {
             toast({ title: `Error fetching ${type}`, description: error.message || 'An unexpected error occurred.', variant: 'destructive'});
        } finally {
            setIsLoading(prev => ({...prev, [type]: false}));
        }
    };


    useEffect(() => {
        fetchData('departments');
        fetchData('blocks');
        fetchData('speeds');
    }, [token]);

    const handleAddItem = async (name: string) => {
        if (!token) {
            toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
            return;
        }

        const endpointMap: Record<SettingType, string> = {
            departments: 'https://iprequestapi.globizsapp.com/api/departments',
            blocks: 'https://iprequestapi.globizsapp.com/api/blocks',
            speeds: 'https://iprequestapi.globizsapp.com/api/connectionspeeds',
        };

        try {
             const response = await fetch(endpointMap[activeTab], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name }),
            });

            const result = await response.json();

            if (result.success) {
                toast({ title: 'Success', description: `${activeTab.slice(0, -1)} added successfully.` });
                fetchData(activeTab); // Refresh data for the current tab
                setIsAddDialogOpen(false);
            } else {
                throw new Error(result.message || `Failed to add ${activeTab.slice(0, -1)}.`);
            }

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleEditItem = (item: any) => {
        // TODO: Implement edit functionality
        toast({ title: "Not Implemented", description: "Edit functionality is not yet available." });
        console.log("Edit:", item, "from", activeTab);
    };

    const handleDeleteItem = (item: any) => {
        // TODO: Implement delete functionality
        toast({ title: "Not Implemented", description: "Delete functionality is not yet available." });
        console.log("Delete:", item, "from", activeTab);
    };

    const renderTable = (type: SettingType) => {
        const dataMap: Record<SettingType, any[]> = {
            departments,
            blocks,
            speeds,
        };
        const columnMap: Record<SettingType, { key: string, label: string }[]> = {
            departments: [{ key: 'name', label: 'Department Name' }],
            blocks: [{ key: 'name', label: 'Block Name' }],
            speeds: [{ key: 'name', label: 'Connection Speed' }],
        };

        return isLoading[type] ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <SettingsTable 
                data={dataMap[type]} 
                columns={columnMap[type]}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
            />
        );
    }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-3xl font-bold">Admin Settings</h1>
             <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </div>
      
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingType)}>
            <TabsList>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="speeds">Connection Speeds</TabsTrigger>
            </TabsList>
            <TabsContent value="departments" className="mt-4">
                {renderTable('departments')}
            </TabsContent>
            <TabsContent value="blocks" className="mt-4">
                {renderTable('blocks')}
            </TabsContent>
            <TabsContent value="speeds" className="mt-4">
                {renderTable('speeds')}
            </TabsContent>
        </Tabs>

        <AddSettingDialog
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onConfirm={handleAddItem}
            settingType={activeTab}
        />
    </div>
  );
}
