'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, KeyRound, User, Building } from 'lucide-react';
import { useAuth } from './auth-provider';
import { API_BASE_URL } from '@/lib/api';

// --- Logic remains unchanged ---

const formSchema = z.object({
  mobile: z
    .string()
    .trim()
    .refine((val) => val.length === 10 && /^\d{10}$/.test(val), {
      message: 'Mobile number must be exactly 10 digits.'
    }),
  otp: z
    .string()
    .trim()
    .refine((val) => val === '' || (val.length === 6 && /^\d{6}$/.test(val)), {
      message: 'OTP must be exactly 6 digits.'
    })
    .optional()
});

const mobileOnlySchema = z.object({
  mobile: z
    .string()
    .trim()
    .refine((val) => val.length === 10, {
      message: 'Mobile number must be exactly 10 digits.'
    })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Mobile number must contain only digits.'
    })
});

type LoginType = 'official' | 'requester';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setOtpSent] = useState(false);
  const [isOtpLoading, setOtpLoading] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('requester');
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: '',
      otp: ''
    },
    mode: 'onSubmit',
    reValidateMode: 'onBlur'
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isOtpSent) {
      toast({
        title: 'Error',
        description: 'Please send OTP first.',
        variant: 'destructive'
      });
      return;
    }

    if (!values.otp || values.otp.length !== 6) {
      form.setError('otp', {
        type: 'manual',
        message: 'Please enter a valid 6-digit OTP.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: loginType,
          username: values.mobile,
          otp: values.otp
        })
      });

      const result = await response.json();

      if (result.success && result.data.accessToken) {
        login(result.data.accessToken, result.data);

        if (!result.data.name) {
          localStorage.setItem('isNewUser', 'true');
        }

        toast({
          title: 'Success',
          description: 'Login successful!'
        });

        router.push('/dashboard');
      } else {
        throw new Error(
          result.message || 'OTP verification failed. Please try again.'
        );
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOtp() {
    const mobileValue = form.getValues('mobile').trim();
    const result = mobileOnlySchema.safeParse({ mobile: mobileValue });

    if (!result.success) {
      const errorMessage =
        result.error.errors[0]?.message || 'Invalid mobile number';
      form.setError('mobile', { type: 'manual', message: errorMessage });
      return;
    }

    setOtpLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: loginType,
          username: result.data.mobile
        })
      });

      const apiResult = await response.json();

      if (apiResult.success) {
        setOtpSent(true);
        toast({
          title: 'OTP Sent',
          description: 'An OTP has been sent to your mobile number.'
        });
      } else {
        throw new Error(apiResult.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send OTP. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setOtpLoading(false);
    }
  }

  // --- UI/UX has been updated below ---

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Select your login type and enter your mobile number to receive an OTP.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Login as</FormLabel>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                <Button
                  type="button"
                  variant={loginType === 'requester' ? 'default' : 'ghost'}
                  onClick={() => setLoginType('requester')}
                  disabled={isOtpSent}
                  className="flex items-center justify-center gap-2"
                >
                  <User size={16} />
                  <span>Requester</span>
                </Button>
                <Button
                  type="button"
                  variant={loginType === 'official' ? 'default' : 'ghost'}
                  onClick={() => setLoginType('official')}
                  disabled={isOtpSent}
                  className="flex items-center justify-center gap-2"
                >
                  <Building size={16} />
                  <span>Official</span>
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="10-digit mobile number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10);
                          field.onChange(value);
                          if (form.formState.errors.mobile) {
                            form.clearErrors('mobile');
                          }
                        }}
                        className="pl-10 pr-28" // Increased padding for the button
                        disabled={isOtpSent || isOtpLoading}
                        maxLength={10}
                      />
                      <Button
                        type="button"
                        title="Send OTP"
                        variant="ghost"
                        className="absolute right-1 h-8 px-3 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={sendOtp}
                        disabled={
                          isOtpSent ||
                          isOtpLoading ||
                          field.value.length !== 10 ||
                          !!form.formState.errors.mobile
                        }
                      >
                        {isOtpLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isOtpSent ? (
                          'Sent'
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isOtpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="6-digit OTP"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 6);
                            field.onChange(value);
                            if (form.formState.errors.otp) {
                              form.clearErrors('otp');
                            }
                          }}
                          className="pl-10"
                          disabled={!isOtpSent || isLoading}
                          maxLength={6}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isOtpSent && (
              <div className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify & Login
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4">
        {isOtpSent && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setOtpSent(false);
              form.setValue('otp', '');
              form.clearErrors();
            }}
            disabled={isLoading}
          >
            Change Mobile Number
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

