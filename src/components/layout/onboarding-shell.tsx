'use client';

import React from 'react';
import { OnboardingSidebar } from './sidebar';
import { ProfilePreviewPanel } from './preview-panel';

interface OnboardingShellProps {
  currentStep: number;
  completedSteps: number[];
  profileData: Record<string, unknown>;
  children: React.ReactNode;
}

export function OnboardingShell({ currentStep, completedSteps, profileData, children }: OnboardingShellProps) {
  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Left Sidebar */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} className="hidden lg:flex" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Top bar */}
          <div className="flex items-center justify-end mb-8">
            <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Save & exit
            </button>
          </div>

          {/* Step Content */}
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Right Preview Panel */}
      <ProfilePreviewPanel profileData={profileData} className="hidden xl:block" />
    </div>
  );
}
