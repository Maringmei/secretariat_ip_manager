'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { User, Department } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './auth/auth-provider';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string({ required_error: 'Please select a department.' }),
  reportingOfficer: z.string().min(2, 'Reporting officer is required'),
  ein_sin: z.string().min(5, 'A valid EIN/SIN is required'),
  eofficeOnboarded: z.enum(['yes', 'no'], { required_error: 'This field is required.' }),
  email: z.string().email().refine(val => val.endsWith('.gov.in') || val.endsWith('.nic.in'), 'Email must be a .gov.in or .nic.in address.'),
  whatsapp_no: z.string().length(10, 'WhatsApp number must be 10 digits.'),
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { token, user: authUser } = useAuth();
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        first_name: '',
        last_name: '',
        designation: '',
        department: undefined,
        reportingOfficer: '',
        ein_sin: '',
        eofficeOnboarded: 'no',
        email: '',
        whatsapp_no: '',
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) return;
      try {
        const response = await fetch('https://iprequestapi.globizsapp.com/api/departments', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (result.success) {
          setDepartments(result.data);
        } else {
          console.error("Failed to fetch departments");
          toast({ title: "Error", description: "Could not load department data.", variant: "destructive" });
        }
      } catch (error) {
         console.error("Error fetching departments", error);
         toast({ title: "Error", description: "An error occurred while fetching departments.", variant: "destructive" });
      }
    };

    fetchDepartments();
  }, [token, toast]);


  useEffect(() => {
    const fetchProfile = async () => {
        if (!token || !authUser?.id || departments.length === 0) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`https://iprequestapi.globizsapp.com/api/requesters/${authUser.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                const profileData = result.data;
                const department = departments.find(d => d.name === profileData.department_name);

                form.reset({
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    designation: profileData.designation || '',
                    department: department ? String(department.id) : undefined,
                    reportingOfficer: profileData.reporting_officer || '', // API response doesn't have this
                    ein_sin: profileData.ein_sin || '',
                    eofficeOnboarded: profileData.eoffice_onboarded ? 'yes' : 'no', // API response doesn't have this
                    email: profileData.email || '',
                    whatsapp_no: profileData.whatsapp_no || '',
                });
            } else {
                toast({ title: "Error", description: "Failed to fetch profile data.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred while fetching your profile.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (departments.length > 0) {
      fetchProfile();
    }
  }, [token, authUser, departments, form, toast]);


  function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSubmitting(true);
    // Simulate API call to update profile
    console.log("Submitting profile data:", values);
    setTimeout(() => {
        setIsSubmitting(false);
        toast({
            title: 'Profile Updated!',
            description: 'Your information has been saved successfully.',
        });
        router.push('/dashboard');
    }, 1500)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}/>
            <FormField control={form.control} name="reportingOfficer" render={({ field }) => (
                <FormItem><FormLabel>Reporting Officer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="ein_sin" render={({ field }) => (
                <FormItem><FormLabel>EIN / SIN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="eofficeOnboarded" render={({ field }) => (
            <FormItem className="space-y-3">
            <FormLabel>E-office Onboarded?</FormLabel>
            <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
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
            <FormField control={form.control} name="whatsapp_no" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp No.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
            </Button>
        </div>
      </form>
    </Form>
  );
}
