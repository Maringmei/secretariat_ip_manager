'use client';
import UsersTable from "@/components/users-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

interface Role {
    role: string;
}

export default function UserManagementPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async (url: string, setData: (data: any) => void, entity: string) => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    toast({
                        title: "Error",
                        description: `Could not load ${entity}.`,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                 toast({
                    title: "Error",
                    description: `An unexpected error occurred while fetching ${entity}.`,
                    variant: "destructive",
                });
            }
        };

        const fetchAllData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchData('https://iprequestapi.globizsapp.com/api/officials', setUsers, 'users'),
                fetchData('https://iprequestapi.globizsapp.com/api/auth/roles', setRoles, 'roles')
            ]);
            setIsLoading(false);
        };

        fetchAllData();
    }, [token, toast]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold">User Management</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Official Users</CardTitle>
                    <CardDescription>Manage officials and their roles within the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <Select>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((r, i) => <SelectItem key={i} value={r.role}>{r.role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button>Apply Filter</Button>
                    </div>

                    {isLoading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <UsersTable users={users} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
