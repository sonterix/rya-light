'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';

function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password: string, minLength = 1): string | null {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return null;
}

export default function AuthPage() {
  const router = useRouter();

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(signInEmail);
    if (emailError) {
      setSignInError(emailError);
      return;
    }

    const passwordError = validatePassword(signInPassword);
    if (passwordError) {
      setSignInError(passwordError);
      return;
    }

    setSignInLoading(true);
    setSignInError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    if (error) {
      setSignInError(error.message);
      setSignInLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(signUpEmail);
    if (emailError) {
      setSignUpError(emailError);
      return;
    }

    const passwordError = validatePassword(signUpPassword, 6);
    if (passwordError) {
      setSignUpError(passwordError);
      return;
    }

    setSignUpLoading(true);
    setSignUpError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
    });

    if (error) {
      setSignUpError(error.message);
      setSignUpLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome to Station</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sign-in">
            <TabsList className="w-full">
              <TabsTrigger value="sign-in" className="flex-1">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="flex-1">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in" className="mt-4">
              <form onSubmit={handleSignIn} noValidate>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sign-in-email">Email</Label>
                    <Input
                      id="sign-in-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(event) => setSignInEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sign-in-password">Password</Label>
                    <Input
                      id="sign-in-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(event) => setSignInPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {signInError && (
                    <p role="alert" className="text-sm text-destructive">
                      {signInError}
                    </p>
                  )}

                  <Button type="submit" disabled={signInLoading} className="w-full">
                    {signInLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="sign-up" className="mt-4">
              <form onSubmit={handleSignUp} noValidate>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sign-up-email">Email</Label>
                    <Input
                      id="sign-up-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(event) => setSignUpEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="sign-up-password">Password</Label>
                    <Input
                      id="sign-up-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(event) => setSignUpPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>

                  {signUpError && (
                    <p role="alert" className="text-sm text-destructive">
                      {signUpError}
                    </p>
                  )}

                  <Button type="submit" disabled={signUpLoading} className="w-full">
                    {signUpLoading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
