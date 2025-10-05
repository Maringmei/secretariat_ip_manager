'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_LOGGED_IN_USER, DEPARTMENTS } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { Block, ConnectionSpeed } from '@/lib/types';
import { useAuth } from './auth/auth-provider';

const requestSchema = z.object({
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Invalid MAC address format.'),
  roomNo: z.string().min(1, 'Room number is required'),
  block: z.string({ required_error: 'Please select a block.' }),
  connectionSpeed: z.string({ required_error: 'Please select a connection speed.' }),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms to proceed.' }),
  }),
});

const UserInfoDisplay = () => {
    const user = MOCK_LOGGED_IN_USER;
    // This is temporary until we fetch departments globally or pass them as props
    const departmentName = DEPARTMENTS.find(d => d.id === user.department)?.name || user.department;

    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Your Information</CardTitle>
                <CardDescription>This information from your profile will be submitted with your request.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                    <div><strong>Designation:</strong> {user.designation}</div>
                    <div><strong>Department:</strong> {departmentName}</div>
                    <div><strong>Email:</strong> {user.email}</div>
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
  const [speeds, setSpeeds] = useState<ConnectionSpeed[]>([]);
  const { token } = useAuth();

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
            toast({ title: 'Error', description: `Could not load ${type}.`, variant: 'destructive' });
        }
    };

    fetchData('https://iprequestapi.globizsapp.com/api/blocks', setBlocks, 'blocks');
    fetchData('https://iprequestapi.globizsapp.com/api/connectionspeeds', setSpeeds, 'connection speeds');

  }, [toast, token]);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      macAddress: '',
      roomNo: '',
      consent: false,
    },
  });

  function onSubmit(values: z.infer<typeof requestSchema>) {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: 'Request Submitted!',
            description: 'Your IP request (REQ005) has been submitted for processing.',
        });
        router.push('/dashboard');
    }, 1500)
  }

  return (
    <div className="space-y-8">
        <UserInfoDisplay />
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="macAddress" render={({ field }) => (
                <FormItem><FormLabel>Computer MAC Address</FormLabel><FormControl><Input placeholder="00:1A:2B:3C:4D:5E" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="roomNo" render={({ field }) => (
                <FormItem><FormLabel>Room No.</FormLabel><FormControl><Input placeholder="e.g., 301" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            </div>
             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField control={form.control} name="block" render={({ field }) => (
                <FormItem>
                    <FormLabel>Block</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a block" /></SelectTrigger></FormControl>
                    <SelectContent>{blocks.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}/>
                <FormField control={form.control} name="connectionSpeed" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Connection Speed</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a speed" /></SelectTrigger></FormControl>
                        <SelectContent>{speeds.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
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
