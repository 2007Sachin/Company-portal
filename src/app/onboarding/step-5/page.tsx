'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Button, Card, ScoreRing, TipCard } from '@/components/ui';

export default function OnboardingStep5() {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    // TODO: Save all data, mark onboarding complete
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLaunched(true);
    setIsLaunching(false);
  };

  if (isLaunched) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center space-y-6 animate-fade-in max-w-lg">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800">
            You&apos;re live!
          </h1>
          <p className="text-lg text-slate-500">
            Your Pulse profile is now active. Recruiters can discover you based on your real coding activity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" onClick={() => router.push('/dashboard')}>
              Go to dashboard
            </Button>
            <Button variant="secondary" size="lg">
              Share your profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingShell currentStep={5} completedSteps={[1, 2, 3, 4]} profileData={{}}>
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-pulse-600">Step 5 of 5</p>
          <h2 className="text-3xl font-semibold text-slate-800">Looking good! Ready to go live?</h2>
          <p className="text-slate-500 text-lg">
            Review your profile and launch when you&apos;re ready.
          </p>
        </div>

        {/* Profile Preview */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-pulse-600 relative">
            <div className="absolute bottom-4 left-6 flex items-end gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pulse-400 to-purple-500 ring-4 ring-white flex items-center justify-center text-2xl font-semibold text-white">
                RK
              </div>
              <div className="pb-1">
                <h3 className="text-xl font-semibold text-white">Rahul Kumar</h3>
                <p className="text-sm text-white/80">Full Stack Developer | React & Node.js</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span>Bangalore, India</span>
              <span>B.Tech, Computer Science</span>
              <span className="text-green-600">Actively looking</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Full Stack Developer', 'Backend Developer', 'DevOps Engineer'].map((role) => (
                <span key={role} className="px-3 py-1 text-xs rounded-chip bg-pulse-50 text-pulse-700 border border-pulse-200">
                  {role}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <ScoreRing score={72} size={80} strokeWidth={6} />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Pulse Score</p>
                  <p className="text-xs text-slate-500">Based on your connected platforms</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Connected platforms</p>
                <div className="flex gap-2">
                  {['GitHub', 'LeetCode', 'Medium'].map((p) => (
                    <span key={p} className="px-2.5 py-1 text-xs rounded-chip bg-green-50 text-green-700 border border-green-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Checklist */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Launch checklist</h3>
          {[
            { label: 'Profile information completed', done: true },
            { label: 'At least 1 platform connected', done: true },
            { label: 'Career preferences set', done: true },
            { label: 'Privacy settings configured', done: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <span className={`text-sm ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
            </div>
          ))}
        </Card>

        <TipCard
          title="Almost there!"
          description="Once you launch, your profile will be visible to recruiters. You can always update your information and privacy settings from the dashboard."
          variant="success"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-4')}>
            Back
          </Button>
          <Button onClick={handleLaunch} size="lg" isLoading={isLaunching}>
            Launch my profile
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
