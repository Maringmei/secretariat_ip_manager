'use client';
import UsersTable from "@/components/users-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { User, Role } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { AddUserDialog } from "@/components/users/add-user-dialog";

export default function UserManagementPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const fetchUsers = async () => {
        if (!token) return;
        setIsLoading(true);
         try {
            const response = await fetch('https://iprequestapi.globizsapp.com/api/profiles?page=1&name=&designation=&username=&email=&status=', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            } else {
                toast({
                    title: "Error",
                    description: `Could not load users.`,
                    variant: "destructive",
                });
            }
        } catch (error) {
             toast({
                title: "Error",
                description: `An unexpected error occurred while fetching users.`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const fetchRoles = async () => {
         if (!token) return;
         try {
            const response = await fetch('https://iprequestapi.globizsapp.com/api/auth/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setRoles(result.data);
            } else {
                 toast({
                    title: "Error",
                    description: `Could not load roles.`,
                    variant: "destructive",
                });
            }
        } catch (error) {
              toast({
                title: "Error",
                description: `An unexpected error occurred while fetching roles.`,
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchRoles();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const handleCreateUser = async (newUser: Omit<User, 'id'>) => {
        if (!token) return;
        try {
            const response = await fetch('https://iprequestapi.globizsapp.com/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: 'Success', description: 'User added successfully.' });
                fetchUsers(); // Refresh user list
                setIsAddUserOpen(false);
            } else {
                throw new Error(result.message || 'Failed to add user.');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="font-headline text-3xl font-bold">User Management</h1>
                <Button onClick={() => setIsAddUserOpen(true)}>
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
            <AddUserDialog
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onConfirm={handleCreateUser}
                roles={roles}
            />
        </div>
    );
}
