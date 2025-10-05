
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
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AddSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  settingType: 'departments' | 'blocks' | 'speeds';
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
});

export function AddSettingDialog({ isOpen, onClose, onConfirm, settingType }: AddSettingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const settingName = settingType.slice(0, -1); // 'department', 'block', 'speed'
  const title = `Add New ${settingName.charAt(0).toUpperCase() + settingName.slice(1)}`;
  const description = `Enter the name for the new ${settingName}.`;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    await onConfirm(values.name);
    setIsSubmitting(false);
    form.reset();
  };

  // Reset form when dialog is opened/closed to clear previous validation states
  if (!isOpen && form.formState.isDirty) {
      form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <FormControl>
                                    <Input id="name" {...field} className="col-span-3" />
                                </FormControl>
                                <FormMessage className='col-start-2 col-span-3'/>
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add {settingName}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
