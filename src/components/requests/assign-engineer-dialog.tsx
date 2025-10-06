
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
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

interface AssignEngineerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { engineerId: number, remark?: string }) => Promise<void>;
  isSubmitting: boolean;
}

// Placeholder for Network Engineer type
interface NetworkEngineer extends User {
    // any specific properties for engineers
}

const formSchema = z.object({
  engineerId: z.string({ required_error: 'Please select a network engineer.' }),
  remark: z.string().optional(),
});

export function AssignEngineerDialog({ isOpen, onClose, onConfirm, isSubmitting }: AssignEngineerDialogProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [engineers, setEngineers] = useState<NetworkEngineer[]>([]);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            engineerId: undefined,
            remark: '',
        },
    });

    useEffect(() => {
        const fetchEngineers = async () => {
            if (!token) return;
            try {
                // FIXME: Replace with the actual endpoint to fetch network engineers
                const response = await fetch(`${API_BASE_URL}/users?role=engineer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setEngineers(result.data);
                } else {
                    // Using mock data as a fallback
                    console.warn("Failed to fetch engineers, using mock data. Update the endpoint in assign-engineer-dialog.tsx");
                    setEngineers([
                        {id: 101, name: "Rahul Sharma", designation: "Network Engineer"},
                        {id: 102, name: "Priya Singh", designation: "Sr. Network Engineer"},
                    ] as NetworkEngineer[]);
                    // toast({ title: 'Error', description: 'Could not load network engineers.', variant: 'destructive'});
                }
            } catch (error: any) {
                 console.warn("Failed to fetch engineers, using mock data. Update the endpoint in assign-engineer-dialog.tsx");
                 setEngineers([
                    {id: 101, name: "Rahul Sharma", designation: "Network Engineer"},
                    {id: 102, name: "Priya Singh", designation: "Sr. Network Engineer"},
                ] as NetworkEngineer[]);
                // toast({ title: 'Error', description: error.message || 'Failed to fetch engineers.', variant: 'destructive' });
            }
        };

        if (isOpen) {
            fetchEngineers();
        }
    }, [isOpen, token, toast]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onConfirm({
            engineerId: parseInt(values.engineerId, 10),
            remark: values.remark
        });
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
                    <DialogTitle>Assign Network Engineer</DialogTitle>
                    <DialogDescription>Select a network engineer to handle this approved request.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="engineerId" render={({ field }) => (
                        <FormItem>
                            <Label>Network Engineer</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an engineer" /></SelectTrigger></FormControl>
                            <SelectContent>{engineers.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name} - {e.designation}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="remark" render={({ field }) => (
                        <FormItem><Label>Remark (Optional)</Label><FormControl><Textarea placeholder="Add any relevant remarks for the engineer..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign Engineer
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
