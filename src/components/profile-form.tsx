
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
import { useAuth } from '@/components/auth/auth-provider';
import { API_BASE_URL } from '@/lib/api';
import { Combobox } from '@/components/ui/combobox';
import { FileUpload } from './ui/file-upload';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string({ required_error: 'Please select a department.' }),
  reportingOfficer: z.string().min(2, 'Reporting officer is required'),
  eofficeOnboarded: z.enum(['yes', 'no'], { required_error: 'This field is required.' }),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => /^[^@]+@([a-z0-9.-]+\.)?(gov\.in|nic\.in)$/i.test(email),
      { message: "Email must end with @gov.in or @nic.in" }
    ),
  whatsapp_no: z.string().length(10, 'WhatsApp number must be 10 digits.'),
  
  ein_sin: z.string().optional(),
  id_card_no: z.string().optional(),
  id_card_file: z.any().optional(),

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

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { token, user: authUser, login } = useAuth();
  const [hasEinSin, setHasEinSin] = useState(true);
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        first_name: '',
        last_name: '',
        designation: '',
        department: undefined,
        reportingOfficer: '',
        eofficeOnboarded: undefined,
        email: '',
        whatsapp_no: user?.whatsapp_no || '',
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/departments`, {
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
        if (!token || departments.length === 0) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/requesters/0`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success && result.data) {
                const profileData = result.data;
                const department = departments.find(d => d.name === profileData.department_name);

                form.reset({
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    designation: profileData.designation || '',
                    department: department ? String(department.id) : undefined,
                    reportingOfficer: '', // API response doesn't have this
                    ein_sin: profileData.ein_sin || undefined,
                    id_card_no: profileData.id_card_no || undefined,
                    id_card_file: profileData.id_card_file || undefined,
                    eofficeOnboarded: undefined, // API response doesn't have this
                    email: profileData.email || '',
                    whatsapp_no: profileData.whatsapp_no || authUser?.whatsapp_no || '',
                });

                if (profileData.ein_sin) {
                    setHasEinSin(true);
                } else if (profileData.id_card_no || profileData.id_card_file) {
                    setHasEinSin(false);
                }

            } else if (result.success && !result.data) {
                // This is a new user, form is pre-filled with defaults.
            }
            else {
                toast({ title: "Note", description: result.message || "Could not fetch profile data. Please create one.", variant: "default" });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred while fetching your profile.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (departments.length > 0) {
      fetchProfile();
    } else {
        // If there are no departments, we probably still want to stop loading
        setIsLoading(false);
    }
  }, [token, departments, form, toast, authUser]);

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

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!token) {
        toast({ title: "Error", description: "You are not authenticated.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    let idCardUrl;
    if (!hasEinSin && values.id_card_file?.[0]) {
        // Only upload if it's a new file, not an existing URL string
        if (typeof values.id_card_file[0] !== 'string') {
            idCardUrl = await uploadFile(values.id_card_file[0]);
            if (!idCardUrl) {
                setIsSubmitting(false);
                return;
            }
        }
    }
    
    const requestBody: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: parseInt(values.department, 10),
        designation: values.designation,
        email: values.email,
        whatsapp_no: values.whatsapp_no,
    };
    
    if (hasEinSin) {
        requestBody.ein_sin = values.ein_sin;
    } else {
        requestBody.id_card_no = values.id_card_no;
        if(idCardUrl) {
            requestBody.id_card_file = idCardUrl;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/requesters`, {
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
                title: 'Profile Updated!',
                description: 'Your information has been saved successfully.',
            });
            
            if (authUser) {
                const updatedUser = { 
                    ...authUser, 
                    name: `${values.first_name} ${values.last_name}`, 
                    designation: values.designation, 
                    profileComplete: true,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    email: values.email,
                    whatsapp_no: values.whatsapp_no,
                    ein_sin: values.ein_sin,
                    id_card_no: values.id_card_no,
                };
                const storedToken = localStorage.getItem('accessToken');
                if (storedToken) {
                    login(storedToken, updatedUser); 
                }
            }
            
            localStorage.removeItem('isNewUser');
            router.push('/dashboard');
        } else {
            throw new Error(result.message || 'Failed to update profile.');
        }

    } catch (error: any) {
        toast({
            title: 'Update Failed',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Your first name" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Your last name" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="Your designation" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField
              control={form.control}
              name="department"
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
            <FormField control={form.control} name="reportingOfficer" render={({ field }) => (
                <FormItem><FormLabel>Reporting Officer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             {hasEinSin ? (
                 <FormField control={form.control} name="ein_sin" render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between">
                            <FormLabel>EIN / SIN</FormLabel>
                            <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => {
                                setHasEinSin(false);
                                form.setValue('ein_sin', undefined);
                                form.clearErrors('ein_sin');
                            }}>
                                Does not have EIN/SIN
                            </Button>
                        </div>
                        <FormControl><Input placeholder="Your Employee/Service ID" {...field} value={field.value ?? ''} /></FormControl>
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
                                    form.clearErrors('id_card_no');
                                    form.clearErrors('id_card_file');
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
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="your.email@gov.in" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="whatsapp_no" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp No.</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        
            <FormField control={form.control} name="eofficeOnboarded" render={({ field }) => (
                <FormItem className="space-y-3 md:col-span-2">
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

    
