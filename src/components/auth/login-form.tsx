'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone } from 'lucide-react';
import { MOCK_LOGGED_IN_USER } from '@/lib/data';

const formSchema = z.object({
  mobile: z.string().min(10, {
    message: 'Mobile number must be 10 digits.',
  }).max(10, {
    message: 'Mobile number must be 10 digits.',
  }).regex(/^\d+$/, {
    message: "Mobile number must contain only digits."
  }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call for OTP
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'OTP Sent',
        description: 'A One-Time Password has been sent to your mobile.',
      });

      // In a real app, you would navigate to an OTP verification page.
      // For this demo, we'll simulate a successful login and redirect.
      // We will also check if the user profile is complete.
      if (MOCK_LOGGED_IN_USER.profileComplete) {
        router.push('/dashboard');
      } else {
        router.push('/profile');
      }

    }, 1500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="9876543210" {...field} className="pl-10" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Send OTP
        </Button>
      </form>
    </Form>
  );
}
