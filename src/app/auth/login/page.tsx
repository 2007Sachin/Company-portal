'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

type UserType = 'candidate' | 'recruiter';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Functional mock login
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(userType === 'candidate' ? '/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Functional mock for Google Auth
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    router.push(userType === 'candidate' ? '/dashboard' : '/recruiter/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Branding (Matching Landing Page Aesthetic) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden transition-colors duration-500">
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

          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest">
                {userType === 'candidate' ? 'Activity-as-Pedigree' : 'High-Signal Recruitment'}
            </div>
            
            {userType === 'candidate' ? (
              <>
                <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                  Your work is your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">new pedigree.</span>
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-md">
                  Sign in to manage your Pulse Score and connect with high-signal recruitment pipelines.
                </p>
                <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-sm space-y-4 max-w-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white">84</div>
                       <div>
                          <p className="text-sm font-bold text-white">Rahul S.</p>
                          <p className="text-xs text-slate-500">Fullstack Engineer</p>
                       </div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[84%]" />
                    </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
                  Cut through <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">the noise.</span>
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-md">
                  Access verified developer activity data and stop guessing who has the right skills.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                   <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-2xl font-bold text-blue-400">40%</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Faster Hiring</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-2xl font-bold text-cyan-400">60%</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pass Rate</p>
                   </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-6 text-slate-500 text-sm font-medium">
            <span>&copy; 2025 Pulse</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
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

          {/* USER TYPE TOGGLE */}
          <div className="bg-slate-100 p-1 rounded-2xl flex relative overflow-hidden h-12 shadow-inner">
             <div 
               className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${
                 userType === 'recruiter' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
               }`}
             />
             <button 
               onClick={() => setUserType('candidate')}
               className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-200 ${
                 userType === 'candidate' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Candidate
             </button>
             <button 
               onClick={() => setUserType('recruiter')}
               className={`flex-1 relative z-10 text-sm font-bold transition-colors duration-200 ${
                 userType === 'recruiter' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Recruiter
             </button>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {userType === 'candidate' ? 'Developer Login' : 'Recruiter Login'}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {userType === 'candidate' 
                ? 'Sign in to manage your Pulse Profile' 
                : 'Access the Pulse talent intelligence engine'}
            </p>
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
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
              <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-wider">or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Work email address"
                type="email"
                placeholder={userType === 'candidate' ? "you@example.com" : "hiring@company.com"}
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
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" 
                size="lg" 
                isLoading={isLoading}
            >
              Sign in as {userType === 'candidate' ? 'Candidate' : 'Recruiter'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium">
            {userType === 'candidate' ? "New to Pulse?" : "Interested in Pulse for your team?"}{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              {userType === 'candidate' ? 'Create your profile' : 'Request Access'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
