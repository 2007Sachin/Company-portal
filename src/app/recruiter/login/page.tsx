'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Linkedin, Mail, Plug, ArrowLeft, Activity, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (method: string) => {
    setLoadingBtn(method);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push('/recruiter/search');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoadingBtn('email-submit');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    router.push('/recruiter/search');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Back to portal */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 space-y-8">
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Pulse.</span>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Find the talent you actually need.
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sign in to access the verified candidate pool.
            </p>
          </div>

          {/* Auth Buttons & Form */}
          <div className="space-y-3">
            {/* LinkedIn */}
            <button
              onClick={() => handleAuth('linkedin')}
              disabled={loadingBtn !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-xl font-medium text-sm
                         hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/40 focus:ring-offset-2
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                         shadow-sm shadow-[#0A66C2]/10 hover:shadow-md hover:shadow-[#0A66C2]/20"
            >
              {loadingBtn === 'linkedin' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Linkedin className="w-5 h-5" />
              )}
              Continue with LinkedIn
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-medium">or sign in with email</span>
              </div>
            </div>

            {/* Email / Password Form */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 focus:bg-white
                               transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 focus:bg-white
                               transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loadingBtn !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm
                           hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/30 focus:ring-offset-2
                           transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loadingBtn === 'email-submit' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                Sign in as Recruiter
              </button>
            </form>

            {/* ATS Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
              </div>
            </div>

            {/* ATS Integration */}
            <button
              onClick={() => handleAuth('ats')}
              disabled={loadingBtn !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                         bg-indigo-50 text-indigo-700 border border-indigo-100
                         hover:bg-indigo-100 hover:border-indigo-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loadingBtn === 'ats' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plug className="w-5 h-5 text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
              )}
              Connect your ATS
              <span className="text-indigo-400 text-xs font-normal">(Greenhouse / Lever)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
