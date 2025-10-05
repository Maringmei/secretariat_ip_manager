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
import type { Block, ConnectionSpeed, Department } from '@/lib/types';
import { useAuth } from './auth/auth-provider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const macAddressRegex = /^(?:[0-9A-Fa-f]{2}([:-]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{12}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gov\.in|nic\.in)$/;

const requestSchema = z.object({
  mac_address: z.string().regex(macAddressRegex, 'Invalid MAC address format.'),
  room_no: z.string().min(1, 'Room number is required'),
  block_id: z.string({ required_error: 'Please select a block.' }),
  connectionSpeed: z.string().optional(), // This field is not in the final API body, but might be kept in UI
  reporting_officer: z.string().min(2, 'Reporting officer is required'),
  section: z.string().min(1, 'Section is required'),
  e_office_onboarded: z.enum(['1', '0'], { required_error: 'This field is required.' }),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms to proceed.' }),
  }),
});

const UserInfoDisplay = () => {
    const { user, token } = useAuth();
    const [departmentName, setDepartmentName] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);

     useEffect(() => {
        const fetchDepartments = async () => {
            if (!token) return;
            try {
                const response = await fetch('https://iprequestapi.globizsapp.com/api/departments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setDepartments(result.data);
                }
            } catch (error) {
                console.error("Could not load departments", error);
            }
        };
        fetchDepartments();
    }, [token]);

    useEffect(() => {
        if (user?.department && departments.length > 0) {
            const dept = departments.find(d => String(d.id) === user.department);
            setDepartmentName(dept?.name || user.department);
        } else if (user?.department) {
             setDepartmentName(user.department);
        }
    }, [user, departments]);


    if (!user) return null;

    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Your Information</CardTitle>
                <CardDescription>This information from your profile will be submitted with your request.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Designation:</strong> {user.designation}</div>
                    <div><strong>Department:</strong> {departmentName}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>WhatsApp:</strong> {user.whatsapp_no}</div>
                </div>
            </CardContent>
        </Card>
    )
}


export default function RequestForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { token, user } = useAuth();

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
                setData(result.data);
            } else {
                toast({ title: 'Error', description: `Could not load ${type}.`, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: `An error occurred while loading ${type}.`, variant: 'destructive' });
        }
    };

    fetchData('https://iprequestapi.globizsapp.com/api/blocks', setBlocks, 'blocks');

  }, [toast, token]);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      mac_address: '',
      room_no: '',
      reporting_officer: '',
      section: '',
      consent: false,
    },
  });

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    if (!token || !user) {
        toast({ title: 'Authentication Error', description: 'Could not verify user. Please log in again.', variant: 'destructive'});
        return;
    }

    if (!user.email || !emailRegex.test(user.email)) {
        toast({ title: 'Invalid Email', description: 'Your profile email must be a valid gov.in or nic.in address.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    
    const requestBody = {
        first_name: user.first_name || user.name?.split(' ')[0],
        last_name: user.last_name || user.name?.split(' ').slice(1).join(' '),
        department_id: parseInt(user.department || '0', 10),
        reporting_officer: values.reporting_officer,
        designation: user.designation,
        ein_sin: user.ein_sin,
        email: user.email,
        mobile_no: user.whatsapp_no,
        section: values.section,
        room_no: values.room_no,
        block_id: parseInt(values.block_id, 10),
        e_office_onboarded: values.e_office_onboarded,
        mac_address: values.mac_address,
    };

    try {
        const response = await fetch('https://iprequestapi.globizsapp.com/api/ip-requests', {
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

  return (
    <div className="space-y-8">
        <UserInfoDisplay />
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
