
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Block, ConnectionSpeed, Department, User } from '@/lib/types';
import { useAuth } from './auth-provider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { API_BASE_URL } from '@/lib/api';

const macAddressRegex = /^(?:[0-9A-Fa-f]{2}([:-]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{12}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gov\.in|nic\.in)$/;

const requestSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().regex(emailRegex, 'Email must be a valid gov.in or nic.in address.'),
  whatsapp_no: z.string().length(10, 'WhatsApp number must be 10 digits'),
  designation: z.string().min(2, 'Designation is required'),
  department_id: z.string({ required_error: 'Please select a department.' }),
  ein_sin: z.string().min(1, 'A valid EIN/SIN is required'),

  mac_address: z.string().regex(macAddressRegex, 'Invalid MAC address format.'),
  room_no: z.string().min(1, 'Room number is required'),
  block_id: z.string({ required_error: 'Please select a block.' }),
  reporting_officer: z.string().min(2, 'Reporting officer is required'),
  section: z.string().min(1, 'Section is required'),
  e_office_onboarded: z.enum(['1', '0'], { required_error: 'This field is required.' }),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms to proceed.' }),
  }),
});

interface RequestFormProps {
    isForSelf: boolean;
}

export default function RequestForm({ isForSelf }: RequestFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { token, user } = useAuth();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      mac_address: '',
      room_no: '',
      reporting_officer: '',
      section: '',
      consent: false,
      first_name: '',
      last_name: '',
      email: '',
      whatsapp_no: '',
      designation: '',
      ein_sin: '',
      e_office_onboarded: '0',
    },
  });

  useEffect(() => {
    const fetchProfileForSelf = async () => {
        if (token && isForSelf && departments.length > 0) {
            setIsFormLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/requesters/0`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success && result.data) {
                    const profile: User = result.data;
                    const userDepartment = departments.find(d => d.name === profile.department_name);

                    form.reset({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        email: profile.email || '',
                        whatsapp_no: profile.whatsapp_no || '',
                        designation: profile.designation || '',
                        department_id: userDepartment ? String(userDepartment.id) : undefined,
                        ein_sin: profile.ein_sin || '',
                        // Reset other fields
                        mac_address: '',
                        room_no: '',
                        reporting_officer: 'N/A',
                        section: '',
                        consent: false,
                        e_office_onboarded: '0',
                    });
                } else {
                     toast({ title: "Note", description: "Could not fetch profile. Please fill out the form manually.", variant: "default" });
                }
            } catch (error) {
                 toast({ title: "Error", description: "An error occurred while fetching your profile.", variant: "destructive" });
            } finally {
                setIsFormLoading(false);
            }
        } else {
            setIsFormLoading(false);
        }
    }

    if (isForSelf) {
        // We wait for departments to be loaded before fetching profile to ensure we can match it.
        if (departments.length > 0) {
            fetchProfileForSelf();
        }
    } else {
         form.reset({
            mac_address: '',
            room_no: '',
            reporting_officer: '',
            section: '',
            consent: false,
            first_name: '',
            last_name: '',
            email: '',
            whatsapp_no: '',
            designation: '',
            ein_sin: '',
            e_office_onboarded: '0',
        });
        setIsFormLoading(false);
    }
  }, [user, form, isForSelf, token, toast, departments]);


  useEffect(() => {
    const fetchData = async (url: string, setData: (data: any[]) => void, type: string) => {
        if (!token) return;
         try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                const activeItems = result.data.filter((item: any) => item.is_active !== 0);
                setData(activeItems);
            } else {
                toast({ title: 'Error', description: `Could not load ${type}.`, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: `An error occurred while loading ${type}.`, variant: 'destructive' });
        }
    };

    fetchData(`${API_BASE_URL}/blocks`, setBlocks, 'blocks');
    fetchData(`${API_BASE_URL}/departments`, setDepartments, 'departments');

  }, [toast, token]);

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    if (!token || !user) {
        toast({ title: 'Authentication Error', description: 'Could not verify user. Please log in again.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    
    const requestBody = {
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: parseInt(values.department_id, 10),
        reporting_officer: values.reporting_officer,
        designation: values.designation,
        ein_sin: values.ein_sin,
        email: values.email,
        mobile_no: values.whatsapp_no,
        section: values.section,
        room_no: values.room_no,
        block_id: parseInt(values.block_id, 10),
        e_office_onboarded: values.e_office_onboarded,
        mac_address: values.mac_address,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/ip-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (result.success) {
            toast({
                title: 'Request Submitted!',
                description: result.message || 'Your IP request has been submitted for processing.',
            });
            router.push('/dashboard');
        } else {
            throw new Error(result.message || 'Failed to submit request.');
        }

    } catch (error: any) {
        toast({
            title: 'Submission Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive'
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  if (isFormLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Applicant Information</CardTitle>
                    <CardDescription>
                        {isForSelf 
                            ? "This information from your profile will be submitted with your request. You can edit it if needed." 
                            : "Enter the information for the employee this request is for."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="first_name" render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Applicant's first name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="last_name" render={({ field }) => (
                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Applicant's last name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="designation" render={({ field }) => (
                            <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="Applicant's designation" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="department_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="ein_sin" render={({ field }) => (
                            <FormItem><FormLabel>EIN / SIN</FormLabel><FormControl><Input placeholder="Applicant's Employee/Service ID" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="applicant.email@gov.in" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="whatsapp_no" render={({ field }) => (
                            <FormItem><FormLabel>WhatsApp No.</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Request Details</CardTitle>
                    <CardDescription>Provide the details for the device requiring an IP address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="mac_address" render={({ field }) => (
                            <FormItem><FormLabel>Computer MAC Address</FormLabel><FormControl><Input placeholder="00:1A:2B:3C:4D:5E" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="room_no" render={({ field }) => (
                            <FormItem><FormLabel>Room No.</FormLabel><FormControl><Input placeholder="e.g., 301" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="section" render={({ field }) => (
                        <FormItem><FormLabel>Section</FormLabel><FormControl><Input placeholder="e.g., Sec A" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="reporting_officer" render={({ field }) => (
                            <FormItem><FormLabel>Reporting Officer</FormLabel><FormControl><Input placeholder="Officer's name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="block_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Block</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a block" /></SelectTrigger></FormControl>
                            <SelectContent>{blocks.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}/>
                        <FormField control={form.control} name="e_office_onboarded" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>E-office Onboarded?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="1" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="0" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>

            <FormField control={form.control} name="consent" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Consent</FormLabel>
                        <p className="text-sm text-muted-foreground">
                        I hereby agree that the allotted internet connection will be used strictly for official Government work in accordance with IT security and usage policies.
                        </p>
                        <FormMessage />
                    </div>
                </FormItem>
            )}/>
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
