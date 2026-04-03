'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with real Supabase signup when credentials are configured
      // const { data, error } = await signUpWithEmail(email, password, fullName);
      // if (error) throw error;

      // Demo mode: simulate account creation and redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/onboarding/step-1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // TODO: Replace with real Google OAuth when Supabase is configured
    // const { error } = await signInWithGoogle();
    // if (error) setError(error.message);

    // Demo mode: redirect to onboarding
    router.push('/onboarding/step-1');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #312e81, #4338ca, #6366f1)' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-3xl font-bold font-display text-white">Pulse</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Build your Career Passport
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Join thousands of developers who showcase their real coding activity instead of static resumes.
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3 max-w-sm">
            {[
              { icon: '🔗', title: 'Connect Platforms', desc: 'GitHub, LeetCode, Medium' },
              { icon: '📊', title: 'Live Pulse Score', desc: 'Updated in real-time' },
              { icon: '🎯', title: 'Get Discovered', desc: 'By top recruiters' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="text-xs text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl pulse-gradient flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-bold font-display text-white">Pulse</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-display text-white">Create your account</h1>
            <p className="text-slate-400">Start building your live developer profile</p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-200 font-medium hover:bg-slate-700/80 hover:border-slate-500/50 transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950 px-4 text-slate-500">or sign up with email</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Rahul Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Use a mix of letters, numbers, and symbols"
              required
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-pulse-400 hover:text-pulse-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-600">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-slate-500 hover:text-slate-400">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-slate-500 hover:text-slate-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
