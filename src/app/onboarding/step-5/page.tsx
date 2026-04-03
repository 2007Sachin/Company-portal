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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center space-y-8 animate-fade-in max-w-lg">
          <div className="text-7xl animate-float">🚀</div>
          <h1 className="text-4xl font-bold font-display text-white">
            You&apos;re Live!
          </h1>
          <p className="text-lg text-slate-400">
            Your Pulse profile is now active. Recruiters can discover you based on your real coding activity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="secondary" size="lg">
              Share Your Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingShell currentStep={5} completedSteps={[1, 2, 3, 4]} profileData={{}}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xs font-semibold text-pulse-400 uppercase tracking-wider">Step 5 of 5</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-white">Launch Your Profile</h2>
          <p className="text-slate-400 text-lg">
            Everything looks great! Review your profile and go live.
          </p>
        </div>

        {/* Profile Preview */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-32 pulse-gradient relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-6 flex items-end gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pulse-400 to-purple-500 ring-4 ring-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                RK
              </div>
              <div className="pb-1">
                <h3 className="text-xl font-bold text-white">Rahul Kumar</h3>
                <p className="text-sm text-white/70">Full Stack Developer | React & Node.js</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">📍 Bangalore, India</span>
              <span className="flex items-center gap-1">🎓 B.Tech, Computer Science</span>
              <span className="flex items-center gap-1">🟢 Actively looking</span>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2">
              {['Full Stack Developer', 'Backend Developer', 'DevOps Engineer'].map((role) => (
                <span key={role} className="px-3 py-1 text-xs rounded-full bg-pulse-500/10 text-pulse-300 border border-pulse-500/20">
                  {role}
                </span>
              ))}
            </div>

            {/* Score Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/30">
              <div className="flex items-center gap-4">
                <ScoreRing score={72} size={80} strokeWidth={6} />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Pulse Score</p>
                  <p className="text-xs text-slate-500">Based on your connected platforms</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connected Platforms</p>
                <div className="flex gap-2">
                  {['GitHub ✓', 'LeetCode ✓', 'Medium ✓'].map((p) => (
                    <span key={p} className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
          <h3 className="text-sm font-semibold text-slate-300">Launch Checklist</h3>
          {[
            { label: 'Profile information completed', done: true },
            { label: 'At least 1 platform connected', done: true },
            { label: 'Career preferences set', done: true },
            { label: 'Privacy settings configured', done: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-600'}`}>
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>
              <span className={`text-sm ${item.done ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
            </div>
          ))}
        </Card>

        <TipCard
          icon="🎉"
          title="You're all set!"
          description="Once you launch, your profile will be visible to recruiters. You can always update your information and privacy settings from the dashboard."
          variant="success"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-4')}>
            ← Back
          </Button>
          <Button onClick={handleLaunch} size="lg" isLoading={isLaunching}>
            🚀 Launch My Profile
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
