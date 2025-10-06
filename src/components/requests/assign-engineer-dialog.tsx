
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, set } from 'date-fns';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

interface AssignEngineerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { engineerId: number, visitDateTime: string, remark?: string }) => Promise<void>;
  isSubmitting: boolean;
  requestId: number;
}

// Placeholder for Network Engineer type
interface NetworkEngineer extends User {
    // any specific properties for engineers
}

const formSchema = z.object({
  engineerId: z.string({ required_error: 'Please select a network engineer.' }),
  visitDate: z.date({ required_error: "A visit date is required." }),
  visitTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  remark: z.string().optional(),
});

export function AssignEngineerDialog({ isOpen, onClose, onConfirm, isSubmitting, requestId }: AssignEngineerDialogProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [engineers, setEngineers] = useState<NetworkEngineer[]>([]);
    const [messageTemplate, setMessageTemplate] = useState('');
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            engineerId: undefined,
            visitDate: undefined,
            visitTime: '09:00',
            remark: '',
        },
    });

    const visitDate = form.watch('visitDate');
    const visitTime = form.watch('visitTime');
    
    const formattedDateTime = () => {
        if (!visitDate || !visitTime) return '';
        const [hours, minutes] = visitTime.split(':');
        const dateWithTime = set(visitDate, { hours: parseInt(hours), minutes: parseInt(minutes) });
        return format(dateWithTime, "PPP 'at' h:mm a");
    }

    useEffect(() => {
        const fetchEngineers = async () => {
            if (!token) return;
            try {
                // FIXME: Replace with the actual endpoint to fetch network engineers
                const response = await fetch(`${API_BASE_URL}/users?role=engineer`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    setEngineers(result.data);
                } else {
                    console.warn("Failed to fetch engineers, using mock data. Update the endpoint in assign-engineer-dialog.tsx");
                    setEngineers([
                        {id: 101, name: "Rahul Sharma", designation: "Network Engineer"},
                        {id: 102, name: "Priya Singh", designation: "Sr. Network Engineer"},
                    ] as NetworkEngineer[]);
                }
            } catch (error: any) {
                 console.warn("Failed to fetch engineers, using mock data. Update the endpoint in assign-engineer-dialog.tsx");
                 setEngineers([
                    {id: 101, name: "Rahul Sharma", designation: "Network Engineer"},
                    {id: 102, name: "Priya Singh", designation: "Sr. Network Engineer"},
                ] as NetworkEngineer[]);
            }
        };

        const fetchMessageTemplate = async () => {
             if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/workflows/template`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setMessageTemplate(result.data);
                } else {
                    toast({ title: 'Error', description: 'Could not load message template.', variant: 'destructive'});
                }
            } catch (error) {
                 toast({ title: 'Error', description: 'Failed to fetch message template.', variant: 'destructive'});
            }
        }

        if (isOpen) {
            fetchEngineers();
            fetchMessageTemplate();
        }
    }, [isOpen, token, toast]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const [hours, minutes] = values.visitTime.split(':');
        const dateWithTime = set(values.visitDate, { hours: parseInt(hours), minutes: parseInt(minutes) });
        const visitDateTimeString = format(dateWithTime, "yyyy-MM-dd HH:mm:ss");

        await onConfirm({
            engineerId: parseInt(values.engineerId, 10),
            visitDateTime: visitDateTimeString,
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
      <DialogContent className="sm:max-w-xl">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                    <DialogTitle>Assign Network Engineer</DialogTitle>
                    <DialogDescription>Select an engineer, schedule a visit, and a notification will be sent.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
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
                    
                    <div>
                        <Label>Visit Date and Time</Label>
                        <div className='grid grid-cols-2 gap-2 mt-2'>
                            <FormField
                                control={form.control}
                                name="visitDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="visitTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField control={form.control} name="remark" render={({ field }) => (
                        <FormItem><Label>Additional Remarks (Optional)</Label><FormControl><Textarea placeholder="Add any relevant remarks for the engineer..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <div>
                        <Label>Message Preview</Label>
                        <Card className="mt-2 bg-muted/80">
                            <CardContent className="p-3 text-sm text-muted-foreground">
                                {messageTemplate && visitDate && visitTime
                                    ? messageTemplate.replace('$', formattedDateTime())
                                    : 'Please select a date and time to see the message preview.'
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting || !visitDate || !visitTime}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign & Submit
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
