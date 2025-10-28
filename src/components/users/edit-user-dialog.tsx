
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { User, Role as RoleType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: User) => Promise<void>;
  roles: RoleType[];
  user: User;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  designation: z.string().min(2, { message: 'Designation is required.' }),
  username: z.string().length(10, { message: 'Username must be a 10-digit mobile number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).refine(
    (email) => /^[^@]+@([a-z0-9.-]+\.)?(gov\.in|nic\.in)$/i.test(email),
    { message: "Email must be a valid gov.in or nic.in address." }
  ),
  role: z.string({ required_error: 'Please select a role.' }),
});

export function EditUserDialog({ isOpen, onClose, onConfirm, roles, user }: EditUserDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            designation: '',
            username: '',
            email: '',
            role: undefined,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                designation: user.designation,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        }
    }, [user, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await onConfirm({ ...user, ...values });
    setIsSubmitting(false);
  };
  
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                    <DialogTitle>Edit User Profile</DialogTitle>
                    <DialogDescription>Update the details for {user.name}.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><Label>Full Name</Label><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="designation" render={({ field }) => (
                        <FormItem><Label>Designation</Label><FormControl><Input placeholder="Designation" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem><Label>Username (Mobile)</Label><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><Label>Email</Label><FormControl><Input placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <Label>Role</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                            <SelectContent>{roles.map((r, i) => <SelectItem key={i} value={r.role}>{r.role}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    