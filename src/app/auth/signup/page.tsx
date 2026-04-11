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
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 8) {
      setError('Password needs to be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with real Supabase signup when credentials are configured
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/onboarding/step-1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // TODO: Replace with real Google OAuth when Supabase is configured
    router.push('/onboarding/step-1');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Branding (Matching Landing Page Aesthetic) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Pulse</span>
          </Link>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest">
                Activity-as-Pedigree
            </div>
            <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">career passport.</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-md">
              Join thousands of developers who showcase their real coding activity instead of static resumes.
            </p>
            
            {/* Minimal feature list preview */}
            <div className="space-y-4 max-w-sm">
                {[
                    "Connect GitHub, LeetCode, Medium",
                    "Live Pulse Score updated in real-time",
                    "Get discovered by high-intent recruiters"
                ].map(feature => (
                    <div key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        {feature}
                    </div>
                ))}
            </div>
          </div>

          <div className="flex gap-6 text-slate-500 text-sm font-medium">
            <span>&copy; 2025 Pulse</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <svg className="group-hover:-translate-x-0.5 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5m7 7-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">Pulse</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 font-medium">Start building your live developer profile</p>
          </div>

          {/* Social Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
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
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-wider">or sign up with email</span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Your name"
                type="text"
                placeholder="Sachin Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl"
              />
              <Input
                label="Email address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
                hint="At least 8 characters"
              />
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" 
                size="lg" 
                isLoading={isLoading}
            >
              Start for Free
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 leading-relaxed px-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-slate-500 hover:text-slate-700 underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
