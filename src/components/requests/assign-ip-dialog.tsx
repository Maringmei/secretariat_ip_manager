
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
import type { ConnectionSpeed } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

interface AssignIpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { ipAddress: string, speedId: number, remark?: string }) => Promise<void>;
  isSubmitting: boolean;
}

const ipAddressRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

const formSchema = z.object({
  ipAddress: z.string().regex(ipAddressRegex, 'Please enter a valid IP address.'),
  speedId: z.string({ required_error: 'Please select a connection speed.' }),
  remark: z.string().optional(),
});

export function AssignIpDialog({ isOpen, onClose, onConfirm, isSubmitting }: AssignIpDialogProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [speeds, setSpeeds] = useState<ConnectionSpeed[]>([]);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ipAddress: '',
            speedId: undefined,
            remark: '',
        },
    });

    useEffect(() => {
        const fetchSpeeds = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/connectionspeeds`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setSpeeds(result.data);
                } else {
                    toast({ title: 'Error', description: 'Could not load connection speeds.', variant: 'destructive'});
                }
            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to fetch speeds.', variant: 'destructive' });
            }
        };

        if (isOpen) {
            fetchSpeeds();
        }
    }, [isOpen, token, toast]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onConfirm({
            ipAddress: values.ipAddress,
            speedId: parseInt(values.speedId, 10),
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
                    <DialogTitle>Assign IP Address</DialogTitle>
                    <DialogDescription>Fill in the details to assign an IP to this request.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="ipAddress" render={({ field }) => (
                        <FormItem><Label>IP Address</Label><FormControl><Input placeholder="e.g., 192.168.1.100" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="speedId" render={({ field }) => (
                        <FormItem>
                            <Label>Connection Speed</Label>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a speed" /></SelectTrigger></FormControl>
                            <SelectContent>{speeds.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="remark" render={({ field }) => (
                        <FormItem><Label>Remark (Optional)</Label><FormControl><Textarea placeholder="Add any relevant remarks..." {...field} /></FormControl><FormMessage /></FormItem>
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
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
