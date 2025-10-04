'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BLOCKS, DEPARTMENTS } from '@/lib/data';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string({ required_error: 'Please select a department.' }),
  reportingOfficer: z.string().min(2, 'Reporting officer is required'),
  einOrSin: z.string().min(5, 'A valid EIN/SIN is required'),
  eofficeOnboarded: z.enum(['yes', 'no'], { required_error: 'This field is required.' }),
  email: z.string().email().refine(val => val.endsWith('.gov.in') || val.endsWith('.nic.in'), 'Email must be a .gov.in or .nic.in address.'),
  whatsappNo: z.string().length(10, 'WhatsApp number must be 10 digits.'),
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      designation: user.designation || '',
      department: user.department || undefined,
      reportingOfficer: user.reportingOfficer || '',
      einOrSin: user.einOrSin || '',
      eofficeOnboarded: user.eofficeOnboarded ? 'yes' : 'no',
      email: user.email || '',
      whatsappNo: user.whatsappNo || '',
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: 'Profile Updated!',
            description: 'Your information has been saved successfully.',
        });
        router.push('/dashboard');
    }, 1500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}/>
            <FormField control={form.control} name="reportingOfficer" render={({ field }) => (
                <FormItem><FormLabel>Reporting Officer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="einOrSin" render={({ field }) => (
                <FormItem><FormLabel>EIN / SIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="eofficeOnboarded" render={({ field }) => (
            <FormItem className="space-y-3">
            <FormLabel>E-office Onboarded?</FormLabel>
            <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                </RadioGroup>
            </FormControl>
            <FormMessage />
            </FormItem>
        )}/>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="whatsappNo" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
            </Button>
        </div>
      </form>
    </Form>
  );
}
