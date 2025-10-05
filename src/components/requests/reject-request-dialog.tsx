
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface RejectRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { remark: string }) => Promise<void>;
  isSubmitting: boolean;
}

const formSchema = z.object({
  remark: z.string().min(10, { message: 'Please provide a clear reason for rejecting (at least 10 characters).' }),
});

export function RejectRequestDialog({ isOpen, onClose, onConfirm, isSubmitting }: RejectRequestDialogProps) {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { remark: '' },
    });

    useEffect(() => {
        if (!isOpen) form.reset();
    }, [isOpen, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onConfirm(values);
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                    <DialogTitle>Reject Request</DialogTitle>
                    <DialogDescription>Please provide a reason for rejecting this request. The request will be moved to the rejected list.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="remark" render={({ field }) => (
                        <FormItem>
                            <Label>Reason for Rejecting</Label>
                            <FormControl>
                                <Textarea placeholder="Explain why this request is being rejected..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Reject
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
