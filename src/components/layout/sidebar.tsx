'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEPS } from '@/types';

interface SidebarProps {
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function OnboardingSidebar({ currentStep, completedSteps, className }: SidebarProps) {
  const router = useRouter();
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <aside className={cn('w-72 bg-slate-900 flex flex-col', className)}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-pulse-600 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Pulse</h1>
            <p className="text-xs text-slate-400">Career Passport</p>
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
              onClick={() => (isCompleted || isCurrent) ? router.push(`/onboarding/step-${step.id}`) : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-card transition-colors duration-150',
                isCurrent && 'bg-slate-800',
                isLocked && 'opacity-40',
                (isCompleted || isCurrent) && 'cursor-pointer hover:bg-slate-800/60'
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                isCurrent && 'bg-pulse-600 text-white',
                isCompleted && !isCurrent && 'bg-green-600 text-white',
                isLocked && 'bg-slate-700 text-slate-500',
              )}>
                {isCompleted && !isCurrent ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{step.id}</span>
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
                  isCurrent ? 'text-slate-400' : 'text-slate-600'
                )}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="p-6 border-t border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Progress</span>
            <span className="text-xs font-semibold text-pulse-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-pulse-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {completedSteps.length} of {totalSteps} steps completed
          </p>
        </div>
      </div>
    </aside>
  );
}
