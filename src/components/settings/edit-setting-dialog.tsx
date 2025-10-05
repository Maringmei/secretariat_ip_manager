
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
import type { SettingItem } from '@/lib/types';
import { Switch } from '../ui/switch';

interface EditSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, isActive: boolean) => Promise<void>;
  settingType: 'departments' | 'blocks' | 'speeds';
  item: SettingItem | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  is_active: z.boolean().default(true),
});

export function EditSettingDialog({ isOpen, onClose, onConfirm, settingType, item }: EditSettingDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { 
            name: '',
            is_active: true,
         },
    });

    useEffect(() => {
        if (item) {
            form.reset({
                name: item.name,
                is_active: (item as any).is_active === 0 || (item as any).is_active === "0" ? false : true,
            });
        }
    }, [item, form]);


    if (!isOpen && form.formState.isDirty) {
      form.reset();
    }
    
    if (!item) return null;
    
    const settingName = settingType.slice(0, -1);
    const title = `Edit ${settingName.charAt(0).toUpperCase() + settingName.slice(1)}`;
    const description = `Update the details for this ${settingName}.`;

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        await onConfirm(values.name, values.is_active);
        setIsSubmitting(false);
    };

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
                            <FormItem className='grid grid-cols-4 items-center gap-x-4 gap-y-2'>
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <FormControl>
                                    <Input id="name" {...field} className="col-span-3" />
                                </FormControl>
                                <FormMessage className='col-start-2 col-span-3'/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                                <Label htmlFor="is_active" className="text-right">Status</Label>
                                <FormControl>
                                    <div className='col-span-3 flex items-center space-x-2'>
                                        <Switch
                                            id="is_active"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <Label htmlFor="is_active" className='text-sm text-muted-foreground'>
                                            {field.value ? 'Active' : 'Inactive'}
                                        </Label>
                                    </div>
                                </FormControl>
                                <FormMessage className='col-start-2 col-span-3'/>
                           </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
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
