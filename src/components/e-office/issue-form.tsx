
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { Block, Department, Floor, EofficeCategory, User } from '@/lib/types';
import { useAuth } from '@/components/auth/auth-provider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { API_BASE_URL } from '@/lib/api';
import { Combobox } from '@/components/ui/combobox';

const emailRegex = /^[^@]+@([a-z0-9.-]+\.)?(gov\.in|nic\.in)$/i;

const issueSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().regex(emailRegex, 'Email must be a valid gov.in or nic.in address.'),
  mobile_no: z.string().length(10, 'WhatsApp number must be 10 digits'),
  designation: z.string().min(2, 'Designation is required'),
  department_id: z.string({ required_error: 'Please select a department.' }),
  ein_sin: z.string().min(1, 'A valid EIN/SIN is required'),
  
  room_no: z.string().min(1, 'Room number is required'),
  block_id: z.string({ required_error: 'Please select a block.' }),
  floor_id: z.string({ required_error: 'Please select a floor.' }),
  reporting_officer: z.string().min(2, 'Reporting officer is required'),
  section: z.string().min(1, 'Section is required'),
  e_office_onboarded: z.enum(['1', '0'], { required_error: 'This field is required.' }),
  
  e_office_issue_category_id: z.string({ required_error: 'Please select an issue category.'}),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
});

export function EofficeIssueForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  
  // Data for dropdowns
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<EofficeCategory[]>([]);
  
  const [isFloorsLoading, setIsFloorsLoading] = useState(false);
  const { token, user } = useAuth();

  const form = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
        first_name: '',
        last_name: '',
        email: '',
        mobile_no: '',
        designation: '',
        department_id: undefined,
        ein_sin: '',
        room_no: '',
        block_id: undefined,
        floor_id: undefined,
        reporting_officer: '',
        section: '',
        e_office_onboarded: undefined,
        e_office_issue_category_id: undefined,
        description: '',
    },
  });

  const selectedBlockId = form.watch('block_id');

  // Effect to pre-fill form with user data
  useEffect(() => {
    const fetchProfileForSelf = async () => {
        if (token && departments.length > 0) {
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
                        mobile_no: profile.whatsapp_no || '',
                        designation: profile.designation || '',
                        department_id: userDepartment ? String(userDepartment.id) : undefined,
                        ein_sin: profile.ein_sin || '',
                        // Reset other fields
                        room_no: '',
                        reporting_officer: '',
                        section: '',
                        e_office_onboarded: undefined,
                        description: '',
                    });
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

    if (departments.length > 0) {
        fetchProfileForSelf();
    }
  }, [user, form, token, toast, departments]);


  // Effect to fetch data for dropdowns
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
    fetchData(`${API_BASE_URL}/e-office-categories`, setCategories, 'categories');

  }, [toast, token]);

  // Effect to fetch floors when block changes
  useEffect(() => {
    const fetchFloors = async (blockId: string) => {
        if (!token || !blockId) return;
        setIsFloorsLoading(true);
        setFloors([]);
        form.setValue('floor_id', '');
        try {
            const response = await fetch(`${API_BASE_URL}/blocks/${blockId}/floors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setFloors(result.data);
            } else {
                setFloors([]);
                toast({ title: 'Error', description: 'Could not load floors for the selected block.', variant: 'destructive' });
            }
        } catch (error) {
            setFloors([]);
            toast({ title: 'Error', description: 'An error occurred while fetching floors.', variant: 'destructive' });
        } finally {
            setIsFloorsLoading(false);
        }
    };

    if (selectedBlockId) {
        fetchFloors(selectedBlockId);
    }
  }, [selectedBlockId, token, toast, form]);


  async function onSubmit(values: z.infer<typeof issueSchema>) {
    if (!token || !user) {
        toast({ title: 'Authentication Error', description: 'Could not verify user. Please log in again.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    
    const requestBody = {
        ...values,
        department_id: parseInt(values.department_id, 10),
        block_id: parseInt(values.block_id, 10),
        floor_id: parseInt(values.floor_id, 10),
        e_office_issue_category_id: parseInt(values.e_office_issue_category_id, 10),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/e-office-issues`, {
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
                title: 'Issue Submitted!',
                description: result.message || 'Your E-Office issue has been submitted.',
            });
            router.push('/e-office-issues');
        } else {
            throw new Error(result.message || 'Failed to submit issue.');
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
                        This information from your profile will be submitted with your request. You can edit it if needed.
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
                        <FormField
                            control={form.control}
                            name="department_id"
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                <FormLabel>Department</FormLabel>
                                <Combobox
                                    options={departments.map(d => ({ value: String(d.id), label: d.name }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select a department"
                                    searchPlaceholder='Search departments...'
                                />
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="ein_sin" render={({ field }) => (
                            <FormItem><FormLabel>EIN / SIN</FormLabel><FormControl><Input placeholder="Applicant's Employee/Service ID" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="applicant.email@gov.in" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="mobile_no" render={({ field }) => (
                            <FormItem><FormLabel>WhatsApp No.</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Location and Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="reporting_officer" render={({ field }) => (
                            <FormItem><FormLabel>Reporting Officer</FormLabel><FormControl><Input placeholder="Officer's name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="section" render={({ field }) => (
                            <FormItem><FormLabel>Section</FormLabel><FormControl><Input placeholder="e.g., Sec A" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="room_no" render={({ field }) => (
                            <FormItem><FormLabel>Room No.</FormLabel><FormControl><Input placeholder="e.g., 301" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="block_id" render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Block</FormLabel>
                                <Combobox
                                    options={blocks.map(b => ({ value: String(b.id), label: b.name }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select a block"
                                    searchPlaceholder='Search blocks...'
                                />
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="floor_id" render={({ field }) => (
                             <FormItem className='flex flex-col'>
                                <FormLabel>Floor</FormLabel>
                                <Combobox
                                    options={floors.map(f => ({ value: String(f.id), label: f.name }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={
                                        isFloorsLoading ? "Loading floors..." :
                                        !selectedBlockId ? "Select a block first" :
                                        "Select a floor"
                                    }
                                    searchPlaceholder='Search floors...'
                                />
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
                     <FormField
                        control={form.control}
                        name="e_office_issue_category_id"
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                            <FormLabel>Issue Category</FormLabel>
                            <Combobox
                                options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select an issue category"
                                searchPlaceholder='Search categories...'
                            />
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the issue in detail..." {...field} rows={5}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Issue
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
