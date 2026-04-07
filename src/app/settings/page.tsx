'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, TipCard } from '@/components/ui';
import { ArrowLeft, Shield, Eye, Mail, Database } from 'lucide-react';

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
          <p className="text-sm font-medium text-slate-700">{label}</p>
          {required && <span className="text-xs text-amber-600 font-medium">Required</span>}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => !required && onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-pulse-600' : 'bg-slate-300'
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

export default function SettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Save to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', desc: 'Anyone can see your profile', icon: <Eye className="w-4 h-4" /> },
    { value: 'recruiters_only', label: 'Recruiters only', desc: 'Only verified recruiters', icon: <Shield className="w-4 h-4" /> },
    { value: 'private', label: 'Private', desc: 'Hidden from search', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Settings</h1>
              <p className="text-xs text-slate-500">Privacy & preferences</p>
            </div>
          </div>
          <Button onClick={handleSave} size="sm">
            {saved ? '✓ Saved' : 'Save changes'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Visibility */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Who can see your profile?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSetting('profile_visibility', option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  settings.profile_visibility === option.value
                    ? 'border-pulse-600 bg-pulse-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={settings.profile_visibility === option.value ? 'text-pulse-600' : 'text-slate-400'}>
                    {option.icon}
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{option.label}</p>
                </div>
                <p className="text-xs text-slate-500">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* What to Show */}
        <Card className="divide-y divide-slate-100 px-5">
          <div className="flex items-center gap-2 pt-5 pb-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">What to show</h3>
          </div>
          <PrivacyToggle
            label="Pulse Score"
            description="Show your overall score and trend on your profile"
            checked={settings.show_pulse_score}
            onChange={(v) => updateSetting('show_pulse_score', v)}
          />
          <PrivacyToggle
            label="Activity timeline"
            description="Show your recent coding activity (commits, PRs, solves)"
            checked={settings.show_activity_timeline}
            onChange={(v) => updateSetting('show_activity_timeline', v)}
          />
          <PrivacyToggle
            label="GitHub activity"
            description="Display your repositories, commits, and contributions"
            checked={settings.show_github_activity}
            onChange={(v) => updateSetting('show_github_activity', v)}
          />
          <PrivacyToggle
            label="LeetCode stats"
            description="Show problems solved, ratings, and streak data"
            checked={settings.show_leetcode_stats}
            onChange={(v) => updateSetting('show_leetcode_stats', v)}
          />
          <PrivacyToggle
            label="Medium articles"
            description="Display your published articles and engagement"
            checked={settings.show_medium_articles}
            onChange={(v) => updateSetting('show_medium_articles', v)}
          />
        </Card>

        {/* Contact Preferences */}
        <Card className="divide-y divide-slate-100 px-5">
          <div className="flex items-center gap-2 pt-5 pb-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Contact preferences</h3>
          </div>
          <PrivacyToggle
            label="Allow recruiter contact"
            description="Let verified recruiters reach out to you through Pulse"
            checked={settings.allow_recruiter_contact}
            onChange={(v) => updateSetting('allow_recruiter_contact', v)}
          />
          <PrivacyToggle
            label="Show email address"
            description="Display your email on your public profile"
            checked={settings.show_email}
            onChange={(v) => updateSetting('show_email', v)}
          />
          <PrivacyToggle
            label="Show phone number"
            description="Display your phone number on your public profile"
            checked={settings.show_phone}
            onChange={(v) => updateSetting('show_phone', v)}
          />
        </Card>

        {/* Consent */}
        <Card className="divide-y divide-slate-100 px-5">
          <div className="flex items-center gap-2 pt-5 pb-2">
            <Database className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Data & consent</h3>
          </div>
          <PrivacyToggle
            label="Data processing consent"
            description="Required — Allow Pulse to process your platform data to generate your score (DPDP Act compliant)"
            checked={settings.data_retention_consent}
            onChange={(v) => updateSetting('data_retention_consent', v)}
            required
          />
          <PrivacyToggle
            label="Feature updates & tips"
            description="Receive occasional updates about new features and career opportunities"
            checked={settings.marketing_consent}
            onChange={(v) => updateSetting('marketing_consent', v)}
          />
        </Card>

        <TipCard
          title="Your data, your rules"
          description="Pulse is DPDP Act compliant. You can change these settings anytime, and request full data deletion at any point. We never sell your data."
          variant="info"
        />
      </main>
    </div>
  );
}
