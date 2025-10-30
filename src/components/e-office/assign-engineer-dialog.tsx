
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
import type { NetworkEngineer } from '@/lib/types';
import { Combobox } from '../ui/combobox';

interface AssignEngineerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { remark: string; engineerId: number; }) => Promise<void>;
  isSubmitting: boolean;
  issueId: string;
}

const formSchema = z.object({
  engineerId: z.string({ required_error: "Please select an technical support engineer." }),
  visitDate: z.date({ required_error: "A visit date is required." }),
  visitTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});

export function AssignEngineerDialog({ isOpen, onClose, onConfirm, isSubmitting, issueId }: AssignEngineerDialogProps) {
    const { token } = useAuth();
    const { toast } = useToast();
    const [engineers, setEngineers] = useState<NetworkEngineer[]>([]);
    const [messageTemplate, setMessageTemplate] = useState('');
    const [messagePreview, setMessagePreview] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            engineerId: undefined,
            visitDate: undefined,
            visitTime: '09:00',
        },
    });

    const visitDate = form.watch('visitDate');
    const visitTime = form.watch('visitTime');
    
    useEffect(() => {
        if (messageTemplate && visitDate && visitTime) {
            const [hours, minutes] = visitTime.split(':');
            const dateWithTime = set(visitDate, { hours: parseInt(hours), minutes: parseInt(minutes) });
            const formattedDateTime = format(dateWithTime, "PPP 'at' h:mm a");
            setMessagePreview(messageTemplate.replace('$', formattedDateTime));
        } else {
            setMessagePreview('Please select a date and time to see the message preview.');
        }
    }, [visitDate, visitTime, messageTemplate]);


    useEffect(() => {
        const fetchDialogData = async () => {
             if (!token) return;
            try {
                // Fetch message template
                const templateResponse = await fetch(`${API_BASE_URL}/e-office-workflows/template`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const templateResult = await templateResponse.json();
                if (templateResult.success) {
                    setMessageTemplate(templateResult.data);
                } else {
                    toast({ title: 'Error', description: 'Could not load message template.', variant: 'destructive'});
                }

                 // Fetch e-office engineers
                const engineerResponse = await fetch(`${API_BASE_URL}/profiles/e-office-engineers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const engineerResult = await engineerResponse.json();
                if (engineerResult.success) {
                    setEngineers(engineerResult.data);
                } else {
                    toast({ title: 'Error', description: 'Could not load e-office engineers.', variant: 'destructive'});
                }

            } catch (error) {
                 toast({ title: 'Error', description: 'Failed to fetch required data for dialog.', variant: 'destructive'});
            }
        }

        if (isOpen) {
            fetchDialogData();
        }
    }, [isOpen, token, toast]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onConfirm({
            remark: messagePreview,
            engineerId: parseInt(values.engineerId, 10),
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
                    <DialogTitle>Assign Technical Support Engineer</DialogTitle>
                    <DialogDescription>Schedule a visit and a notification will be sent to the requester.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <FormField
                        control={form.control}
                        name="engineerId"
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <Label>Support Engineer</Label>
                                <Combobox
                                    options={engineers.map(e => ({ value: String(e.id), label: e.name }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select an technical support engineer"
                                    searchPlaceholder='Search technical support engineers...'
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div>
                        <Label>Visit Date and Time</Label>
                        <div className='grid grid-cols-2 gap-2 mt-2'>
                            <FormField
                                control={form.control}
                                name="visitDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setIsCalendarOpen(false);
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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

                    <div>
                        <Label>The message below will be shared with the requester on WhatsApp</Label>
                        <Card className="mt-2 bg-muted/80">
                            <CardContent className="p-3 text-sm text-muted-foreground">
                                {messagePreview}
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
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
