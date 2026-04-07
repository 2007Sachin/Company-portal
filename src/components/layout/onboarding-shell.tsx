'use client';

import React from 'react';
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
      {/* Left Sidebar */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} className="hidden lg:flex" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-12">
          {/* Top bar */}
          <div className="flex items-center justify-end mb-8">
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
