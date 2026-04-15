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
    <aside className={cn('w-72 bg-white border-r border-slate-200 flex flex-col', className)}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-pulse-600 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Pulse</h1>
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
                'flex items-center gap-3 px-4 py-3 rounded-card transition-colors duration-150',
                isCurrent && 'bg-slate-50 border border-slate-200',
                isLocked && 'opacity-40'
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                isCurrent && 'bg-pulse-600 text-white',
                isCompleted && !isCurrent && 'bg-green-600 text-white',
                isLocked && 'bg-slate-100 text-slate-400',
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
                  isCurrent ? 'text-slate-800' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  'text-xs truncate',
                  isCurrent ? 'text-slate-500' : 'text-slate-400'
                )}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="p-6 border-t border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Progress</span>
            <span className="text-xs font-semibold text-pulse-600">{progressPercent}%</span>
          </div>
          {/* Segmented progress bar */}
          <div className="flex gap-1.5">
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all duration-500',
                  completedSteps.includes(step.id) || currentStep === step.id
                    ? 'bg-pulse-600'
                    : 'bg-slate-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">
            {completedSteps.length} of {totalSteps} steps completed
          </p>
        </div>
      </div>
    </aside>
  );
}
