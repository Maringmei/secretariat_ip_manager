
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
import type { Block, ConnectionSpeed, Department, User, Floor } from '@/lib/types';
import { useAuth } from '@/components/auth/auth-provider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { API_BASE_URL } from '@/lib/api';
import { Combobox } from '@/components/ui/combobox';
import { FindMacAddressDialog } from './requests/find-mac-address-dialog';
import { FileUpload } from './ui/file-upload';

const macAddressRegex = /^(?:[0-9A-Fa-f]{2}([:-]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{12}$/;
const emailRegex = /^[^@]+@([a-z0-9.-]+\.)?(gov\.in|nic\.in)$/i;

const requestSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().regex(emailRegex, 'Email must be a valid gov.in or nic.in address.'),
  whatsapp_no: z.string().length(10, 'WhatsApp number must be 10 digits'),
  designation: z.string().min(2, 'Designation is required'),
  department_id: z.string({ required_error: 'Please select a department.' }),
  
  ein_sin: z.string().optional(),
  id_card_no: z.string().optional(),
  id_card_file: z.any().optional(),

  mac_address: z.string().regex(macAddressRegex, 'Invalid MAC address format. Valid formats: 00:1A:...:5E, 00-1A-...-5E, 001A.2B3C.4D5E, or 001A2B3C4D5E'),
  room_no: z.string().min(1, 'Room number is required'),
  block_id: z.string({ required_error: 'Please select a block.' }),
  floor_id: z.string({ required_error: 'Please select a floor.' }),
  reporting_officer: z.string().min(2, 'Reporting officer is required'),
  section: z.string().min(1, 'Section is required'),
  e_office_onboarded: z.enum(['1', '0'], { required_error: 'This field is required.' }),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms to proceed.' }),
  }),
}).superRefine((data, ctx) => {
    if (!data.ein_sin && !data.id_card_no) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['id_card_no'],
            message: 'ID Number is required if you do not have an EIN/SIN.',
        });
    }
    if (!data.ein_sin && !data.id_card_file) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['id_card_file'],
            message: 'ID Card upload is required if you do not have an EIN/SIN.',
        });
    }
    if (data.ein_sin && data.id_card_no) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ein_sin'],
            message: 'Provide either EIN/SIN or an ID card, not both.',
        });
    }
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
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isFloorsLoading, setIsFloorsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { token, user } = useAuth();
  const [isMacAddressDialogOpen, setIsMacAddressDialogOpen] = useState(false);
  const [hasEinSin, setHasEinSin] = useState(true);

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
      e_office_onboarded: undefined,
      block_id: undefined,
      floor_id: undefined,
    },
  });

  const selectedBlockId = form.watch('block_id');

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
                        ein_sin: profile.ein_sin || undefined,
                        id_card_no: profile.id_card_no || undefined,
                        id_card_file: profile.id_card_file || undefined,
                        // Reset other fields
                        mac_address: '',
                        room_no: '',
                        reporting_officer: '',
                        section: '',
                        consent: false,
                        e_office_onboarded: undefined,
                    });

                    if (!profile.ein_sin && (profile.id_card_no || profile.id_card_file)) {
                        setHasEinSin(false);
                    } else {
                        setHasEinSin(true);
                    }
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
            e_office_onboarded: undefined,
        });
        setHasEinSin(true);
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

  const uploadFile = async (file: File): Promise<string | undefined> => {
    if (!token) return undefined;

    const formData = new FormData();
    formData.append('id_card_file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.data) {
        return result.data.filename;
      } else {
        throw new Error(`Failed to upload ${file.name}: ${result.message}`);
      }
    } catch (error: any) {
      toast({
        title: 'File Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      return undefined;
    }
  };

  async function onSubmit(values: z.infer<typeof requestSchema>) {
    if (!token || !user) {
        toast({ title: 'Authentication Error', description: 'Could not verify user. Please log in again.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    
    let idCardUrl;
    if (!hasEinSin && values.id_card_file?.[0]) {
      idCardUrl = await uploadFile(values.id_card_file[0]);
      if (!idCardUrl) { setIsLoading(false); return; }
    }
    
    const requestBody: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: parseInt(values.department_id, 10),
        reporting_officer: values.reporting_officer,
        designation: values.designation,
        email: values.email,
        mobile_no: values.whatsapp_no,
        section: values.section,
        room_no: values.room_no,
        block_id: parseInt(values.block_id, 10),
        floor_id: parseInt(values.floor_id, 10),
        e_office_onboarded: values.e_office_onboarded,
        mac_address: values.mac_address,
    };
    
    if (hasEinSin) {
      requestBody.ein_sin = values.ein_sin;
    } else {
      requestBody.id_card_no = values.id_card_no;
      requestBody.id_card_file = idCardUrl;
    }


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
    <>
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
                         {hasEinSin ? (
                             <FormField control={form.control} name="ein_sin" render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>EIN / SIN</FormLabel>
                                        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => {
                                            setHasEinSin(false);
                                            form.setValue('ein_sin', undefined);
                                        }}>
                                            Does not have EIN/SIN
                                        </Button>
                                    </div>
                                    <FormControl><Input placeholder="Applicant's Employee/Service ID" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                         ) : (
                            <>
                                <FormField control={form.control} name="id_card_no" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>ID Number</FormLabel>
                                             <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => {
                                                setHasEinSin(true);
                                                form.setValue('id_card_no', undefined);
                                                form.setValue('id_card_file', undefined);
                                            }}>
                                                Have an EIN/SIN?
                                            </Button>
                                        </div>
                                        <FormControl><Input placeholder="Government ID Number" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField
                                    control={form.control}
                                    name="id_card_file"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Upload ID Card</FormLabel>
                                        <FormControl>
                                        <FileUpload
                                            onFileSelect={(file) => field.onChange(file)}
                                            fileType=".pdf,.jpg,.jpeg,.png"
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </>
                         )}

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
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Computer MAC Address</FormLabel>
                                    <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setIsMacAddressDialogOpen(true)}>
                                        How to find?
                                    </Button>
                                </div>
                                <FormControl><Input placeholder="00:1A:2B:3C:4D:5E" {...field} /></FormControl><FormMessage />
                            </FormItem>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a block" /></SelectTrigger></FormControl>
                            <SelectContent>{blocks.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}/>
                        <FormField control={form.control} name="floor_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Floor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBlockId || isFloorsLoading}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                isFloorsLoading ? "Loading floors..." :
                                                !selectedBlockId ? "Select a block first" :
                                                "Select a floor"
                                            } />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {floors.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>)}
                                    </SelectContent>
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
    <FindMacAddressDialog
        isOpen={isMacAddressDialogOpen}
        onClose={() => setIsMacAddressDialogOpen(false)}
    />
    </>
  );
}

    
