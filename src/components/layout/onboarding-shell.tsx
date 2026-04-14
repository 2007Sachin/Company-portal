'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OnboardingSidebar } from './sidebar';

interface OnboardingShellProps {
  currentStep: number;
  completedSteps: number[];
  profileData: Record<string, unknown>;
  children: React.ReactNode;
}

export function OnboardingShell({ currentStep, completedSteps, profileData, children }: OnboardingShellProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Sidebar — desktop only */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} className="hidden lg:flex" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            {/* Mobile logo — hidden on desktop where sidebar shows it */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-pulse-600 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="text-base font-bold text-slate-800">Pulse</span>
            </Link>
            {/* Spacer on desktop so Save & exit stays right-aligned */}
            <span className="hidden lg:block" />
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Save & exit
            </button>
          </div>

          {/* Step Content */}
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
