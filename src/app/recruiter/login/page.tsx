'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Linkedin, Mail, Plug, ArrowLeft, Activity, Loader2 } from 'lucide-react';

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);

  const handleAuth = async (method: string) => {
    setLoadingBtn(method);
    // Simulate auth delay
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
              <Activity className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
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

          {/* Auth Buttons */}
          <div className="space-y-3">
            {/* LinkedIn */}
            <button
              onClick={() => handleAuth('linkedin')}
              onMouseEnter={() => setHoveredBtn('linkedin')}
              onMouseLeave={() => setHoveredBtn(null)}
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

            {/* Work Email */}
            <button
              onClick={() => handleAuth('email')}
              onMouseEnter={() => setHoveredBtn('email')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={loadingBtn !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 rounded-xl font-medium text-sm
                         border border-gray-200 hover:border-gray-300 hover:bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingBtn === 'email' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5 text-gray-400" />
              )}
              Continue with Work Email
            </button>

            {/* Divider */}
            <div className="relative py-2">
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
              onMouseEnter={() => setHoveredBtn('ats')}
              onMouseLeave={() => setHoveredBtn(null)}
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
