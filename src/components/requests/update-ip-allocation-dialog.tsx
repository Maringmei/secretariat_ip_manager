
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
import type { ConnectionSpeed, IpAddress } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { Combobox } from '../ui/combobox';

interface UpdateIpAllocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { ipAddressId: number, speedId: number, remark?: string }) => Promise<void>;
  isSubmitting: boolean;
  requestId: number;
}

const formSchema = z.object({
  ipAddressId: z.string({ required_error: 'Please select an IP address.' }),
  speedId: z.string({ required_error: 'Please select a connection speed.' }),
  remark: z.string().optional(),
});

export function UpdateIpAllocationDialog({ isOpen, onClose, onConfirm, isSubmitting, requestId }: UpdateIpAllocationDialogProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [speeds, setSpeeds] = useState<ConnectionSpeed[]>([]);
    const [ipAddresses, setIpAddresses] = useState<IpAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ipAddressId: undefined,
            speedId: undefined,
            remark: '',
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !isOpen) return;
            setIsLoading(true);

            try {
                // Fetch speeds
                const speedsResponse = await fetch(`${API_BASE_URL}/connectionspeeds`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const speedsResult = await speedsResponse.json();
                if (speedsResult.success) {
                    setSpeeds(speedsResult.data);
                } else {
                    toast({ title: 'Error', description: 'Could not load connection speeds.', variant: 'destructive'});
                }

                // Fetch IP addresses
                const ipResponse = await fetch(`${API_BASE_URL}/ip-addresses?request_id=${requestId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const ipResult = await ipResponse.json();
                if (ipResult.success) {
                    setIpAddresses(ipResult.data);
                } else {
                    toast({ title: 'Error', description: ipResult.message || 'Could not load available IP addresses.', variant: 'destructive'});
                }

            } catch (error: any) {
                toast({ title: 'Error', description: error.message || 'Failed to fetch dialog data.', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, token, toast, requestId]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onConfirm({
            ipAddressId: parseInt(values.ipAddressId, 10),
            speedId: parseInt(values.speedId, 10),
            remark: values.remark
        });
    };

    useEffect(() => {
        if (!isOpen) {
          form.reset();
          setIpAddresses([]);
          setSpeeds([]);
        }
      }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                    <DialogTitle>Update IP Allocation</DialogTitle>
                    <DialogDescription>Select a new IP address and/or connection speed for this request.</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-6">
                        <FormField
                            control={form.control}
                            name="ipAddressId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <Label>IP Address</Label>
                                    <Combobox
                                        options={ipAddresses.map(ip => ({ value: String(ip.id), label: ip.value }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select an IP Address"
                                        searchPlaceholder="Search IP..."
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Allocation
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
