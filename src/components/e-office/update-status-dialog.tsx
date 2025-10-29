
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

interface UpdateStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { remark?: string }) => Promise<void>;
  isSubmitting: boolean;
  statusName: string;
}

const formSchema = z.object({
  remark: z.string().optional(),
});

export function UpdateStatusDialog({ isOpen, onClose, onConfirm, isSubmitting, statusName }: UpdateStatusDialogProps) {
  
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
                    <DialogTitle>Update Status to "{statusName}"</DialogTitle>
                    <DialogDescription>You can add an optional remark for this status change.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <FormField control={form.control} name="remark" render={({ field }) => (
                        <FormItem>
                            <Label>Remark (Optional)</Label>
                            <FormControl>
                                <Textarea placeholder="Add a remark..." {...field} />
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
                    <Button type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Status
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
