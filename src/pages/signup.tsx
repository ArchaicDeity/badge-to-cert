import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
    csrfToken: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const Signup = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      csrfToken: '',
    },
  });

  useEffect(() => {
    const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
    if (token) {
      form.setValue('csrfToken', token);
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload: Record<string, string> = {
      email: values.email,
      password: values.password,
      csrfToken: values.csrfToken,
    };
    if (values.name) {
      payload.name = values.name;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errors = data?.errors ?? data;
        let mapped = false;
        if (errors && typeof errors === 'object') {
          for (const [field, message] of Object.entries(errors as Record<string, unknown>)) {
            if (field in values) {
              form.setError(field as keyof typeof values, { message: String(message) });
              mapped = true;
            }
          }
        }
        if (!mapped) {
          form.setError('root', { message: 'Sign up failed. Please try again.' });
        }
        return;
      }
    } catch {
      form.setError('root', { message: 'Sign up failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" {...form.register('csrfToken')} />

              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;

