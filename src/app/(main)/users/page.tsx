'use client';
import UsersTable from "@/components/users-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { User } from "@/lib/types"; // Role is also in here now
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Search, X } from "lucide-react";
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { Input } from "@/components/ui/input";
import type { Role as RoleType } from "@/lib/types";


export default function UserManagementPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Dialog states
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');


    const fetchUsers = async (filters: Record<string, string> = {}) => {
        if (!token) return;
        setIsLoading(true);

        const queryParams = new URLSearchParams({
            page: '1',
            name: filters.name || '',
            designation: filters.designation || '',
            username: filters.username || '',
            email: filters.email || '',
            role: filters.role || '',
            status: '', // Status filter not implemented yet
        });

         try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/profiles?${queryParams.toString()}`, {
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

    const handleApplyFilters = () => {
        fetchUsers({
            name: nameFilter,
            designation: designationFilter,
            username: usernameFilter,
            email: emailFilter,
            role: roleFilter,
        });
    }

    const handleClearFilters = () => {
        setNameFilter('');
        setDesignationFilter('');
        setUsernameFilter('');
        setEmailFilter('');
        setRoleFilter('');
        fetchUsers();
    }

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

    const handleUpdateUser = async (updatedUser: User) => {
        if (!token || !selectedUser) return;
        try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/profiles/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser)
            });
            const result = await response.json();
             if (result.success) {
                toast({ title: 'Success', description: 'User updated successfully.' });
                fetchUsers(); // Refresh user list
                setIsEditUserOpen(false);
                setSelectedUser(null);
            } else {
                throw new Error(result.message || 'Failed to update user.');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setIsEditUserOpen(true);
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
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter by Name" className="pl-8" value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
                        </div>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter by Designation" className="pl-8" value={designationFilter} onChange={e => setDesignationFilter(e.target.value)} />
                        </div>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter by Username" className="pl-8" value={usernameFilter} onChange={e => setUsernameFilter(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter by Email" className="pl-8" value={emailFilter} onChange={e => setEmailFilter(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r, i) => <SelectItem key={i} value={r.role}>{r.role}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {roleFilter && (
                                <Button variant="ghost" size="icon" onClick={() => setRoleFilter('')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleApplyFilters} className="flex-1">Apply Filter</Button>
                            <Button onClick={handleClearFilters} variant="outline" className="flex-1">Clear Filter</Button>
                        </div>
                    </div>

                    {isLoading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <UsersTable users={users} onEditUser={openEditDialog} />
                    )}
                </CardContent>
            </Card>
            <AddUserDialog
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onConfirm={handleCreateUser}
                roles={roles}
            />
            {selectedUser && (
                <EditUserDialog
                    isOpen={isEditUserOpen}
                    onClose={() => { setIsEditUserOpen(false); setSelectedUser(null); }}
                    onConfirm={handleUpdateUser}
                    roles={roles}
                    user={selectedUser}
                />
            )}
        </div>
    );
}
