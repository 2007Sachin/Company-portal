'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEPS } from '@/types';

interface SidebarProps {
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function OnboardingSidebar({ currentStep, completedSteps, className }: SidebarProps) {
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <aside className={cn('w-72 bg-slate-900/95 border-r border-slate-700/50 backdrop-blur-xl flex flex-col', className)}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl pulse-gradient flex items-center justify-center shadow-lg shadow-pulse-600/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-white">Pulse</h1>
            <p className="text-xs text-slate-500">Career Passport</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 space-y-1">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isLocked = step.id > currentStep && !isCompleted;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isCurrent && 'bg-pulse-600/10 border border-pulse-500/20',
                isCompleted && !isCurrent && 'opacity-80',
                isLocked && 'opacity-40'
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-300',
                isCurrent && 'bg-pulse-600 text-white shadow-md shadow-pulse-600/40',
                isCompleted && !isCurrent && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                isLocked && 'bg-slate-700/50 text-slate-500 border border-slate-600/30',
              )}>
                {isCompleted && !isCurrent ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>

              {/* Step text */}
              <div className="min-w-0">
                <p className={cn(
                  'text-sm font-medium truncate',
                  isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  'text-xs truncate',
                  isCurrent ? 'text-pulse-300' : 'text-slate-600'
                )}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="p-6 border-t border-slate-700/30">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Profile Progress</span>
            <span className="text-xs font-bold text-pulse-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pulse-600 to-pulse-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-600">
            {completedSteps.length} of {totalSteps} steps completed
          </p>
        </div>
      </div>
    </aside>
  );
}
