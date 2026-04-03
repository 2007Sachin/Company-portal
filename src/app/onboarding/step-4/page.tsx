'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Button, Card, TipCard } from '@/components/ui';

interface PrivacyToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

function PrivacyToggle({ label, description, checked, onChange, required }: PrivacyToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-200">{label}</p>
          {required && <span className="text-xs text-amber-400">Required</span>}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => !required && onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-pulse-600' : 'bg-slate-700'
        } ${required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    profile_visibility: 'public' as 'public' | 'recruiters_only' | 'private',
    show_pulse_score: true,
    show_activity_timeline: true,
    show_github_activity: true,
    show_leetcode_stats: true,
    show_medium_articles: true,
    allow_recruiter_contact: true,
    show_email: false,
    show_phone: false,
    data_retention_consent: true,
    marketing_consent: false,
  });

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const visibilityOptions = [
    { value: 'public', label: '🌍 Public', desc: 'Anyone can see your profile' },
    { value: 'recruiters_only', label: '🔒 Recruiters Only', desc: 'Only verified recruiters' },
    { value: 'private', label: '👻 Private', desc: 'Hidden from search' },
  ];

  return (
    <OnboardingShell currentStep={4} completedSteps={[1, 2, 3]} profileData={{}}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-semibold text-pulse-400 uppercase tracking-wider">Step 4 of 5</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-white">Privacy & Trust</h2>
          <p className="text-slate-400 text-lg">
            You&apos;re in control. Choose exactly what recruiters can see about you.
          </p>
        </div>

        {/* Profile Visibility */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Profile Visibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSetting('profile_visibility', option.value)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  settings.profile_visibility === option.value
                    ? 'border-pulse-500/50 bg-pulse-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                }`}
              >
                <p className="text-sm font-semibold text-slate-200">{option.label}</p>
                <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* What to Show */}
        <Card className="divide-y divide-slate-700/30 px-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider pt-5 pb-2">
            What to Show
          </h3>
          <PrivacyToggle
            label="Pulse Score"
            description="Show your overall Pulse Score and trend on your profile"
            checked={settings.show_pulse_score}
            onChange={(v) => updateSetting('show_pulse_score', v)}
          />
          <PrivacyToggle
            label="Activity Timeline"
            description="Show your recent coding activity (commits, PRs, solves)"
            checked={settings.show_activity_timeline}
            onChange={(v) => updateSetting('show_activity_timeline', v)}
          />
          <PrivacyToggle
            label="GitHub Activity"
            description="Display your GitHub repositories, commits, and contributions"
            checked={settings.show_github_activity}
            onChange={(v) => updateSetting('show_github_activity', v)}
          />
          <PrivacyToggle
            label="LeetCode Stats"
            description="Show problems solved, ratings, and streak data"
            checked={settings.show_leetcode_stats}
            onChange={(v) => updateSetting('show_leetcode_stats', v)}
          />
          <PrivacyToggle
            label="Medium Articles"
            description="Display your published tech articles and engagement"
            checked={settings.show_medium_articles}
            onChange={(v) => updateSetting('show_medium_articles', v)}
          />
        </Card>

        {/* Contact Preferences */}
        <Card className="divide-y divide-slate-700/30 px-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider pt-5 pb-2">
            Contact Preferences
          </h3>
          <PrivacyToggle
            label="Allow Recruiter Contact"
            description="Let verified recruiters reach out to you through Pulse"
            checked={settings.allow_recruiter_contact}
            onChange={(v) => updateSetting('allow_recruiter_contact', v)}
          />
          <PrivacyToggle
            label="Show Email Address"
            description="Display your email on your public profile"
            checked={settings.show_email}
            onChange={(v) => updateSetting('show_email', v)}
          />
          <PrivacyToggle
            label="Show Phone Number"
            description="Display your phone number on your public profile"
            checked={settings.show_phone}
            onChange={(v) => updateSetting('show_phone', v)}
          />
        </Card>

        {/* Consent */}
        <Card className="divide-y divide-slate-700/30 px-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider pt-5 pb-2">
            Data & Consent
          </h3>
          <PrivacyToggle
            label="Data Processing Consent"
            description="Required — Allow Pulse to process your platform data to generate your Pulse Score (DPDP Act compliant)"
            checked={settings.data_retention_consent}
            onChange={(v) => updateSetting('data_retention_consent', v)}
            required
          />
          <PrivacyToggle
            label="Marketing Communications"
            description="Receive updates about new features, tips, and career opportunities"
            checked={settings.marketing_consent}
            onChange={(v) => updateSetting('marketing_consent', v)}
          />
        </Card>

        <TipCard
          icon="🛡️"
          title="Your data, your rules"
          description="Pulse is DPDP Act compliant. You can change these settings anytime, and request full data deletion at any point. We never sell your data."
          variant="info"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-3')}>
            ← Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-5')} size="lg">
            Next: Launch Profile
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
