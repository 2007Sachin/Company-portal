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
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Sidebar */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} className="hidden lg:flex" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Autosaving
              </span>
            </div>
            <button className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Exit & Save Draft
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
