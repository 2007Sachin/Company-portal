'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Input, Select, ChipGroup, Button, TipCard } from '@/components/ui';

const JOB_SEARCH_STATUS = [
  { label: 'Actively looking', value: 'actively_looking' },
  { label: 'Open to offers', value: 'open_to_offers' },
  { label: 'Not looking right now', value: 'not_looking' },
];

const COMPANY_SIZES = [
  { label: '🚀 Startup (1-50)', value: 'startup', icon: '🚀' },
  { label: '📈 Growth (50-200)', value: 'growth', icon: '📈' },
  { label: '🏢 Mid (200-1000)', value: 'mid', icon: '🏢' },
  { label: '🏛️ Enterprise (1000+)', value: 'enterprise', icon: '🏛️' },
];

const INDUSTRIES = [
  { label: 'SaaS / Cloud', value: 'saas', icon: '☁️' },
  { label: 'FinTech', value: 'fintech', icon: '💳' },
  { label: 'EdTech', value: 'edtech', icon: '📚' },
  { label: 'HealthTech', value: 'healthtech', icon: '🏥' },
  { label: 'E-commerce', value: 'ecommerce', icon: '🛍️' },
  { label: 'AI / ML', value: 'ai_ml', icon: '🤖' },
  { label: 'Gaming', value: 'gaming', icon: '🎮' },
  { label: 'Social Media', value: 'social', icon: '📱' },
  { label: 'Cybersecurity', value: 'security', icon: '🔒' },
  { label: 'Dev Tools', value: 'devtools', icon: '🔧' },
];

const NOTICE_PERIODS = [
  { label: 'Immediately', value: '0' },
  { label: '15 days', value: '15' },
  { label: '30 days', value: '30' },
  { label: '60 days', value: '60' },
  { label: '90 days', value: '90' },
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    job_search_status: '',
    preferred_locations: '',
    remote_preference: '',
    salary_min: '',
    salary_max: '',
    notice_period: '',
    willing_to_relocate: false,
    preferred_company_sizes: [] as string[],
    preferred_industries: [] as string[],
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <OnboardingShell currentStep={3} completedSteps={[1, 2]} profileData={{}}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-semibold text-pulse-400 uppercase tracking-wider">Step 3 of 5</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-white">Career Path</h2>
          <p className="text-slate-400 text-lg">
            Help us match you with the right opportunities. What does your ideal role look like?
          </p>
        </div>

        {/* Job Search Status */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Current Status
          </h3>

          <Select
            label="Job Search Status"
            options={JOB_SEARCH_STATUS}
            placeholder="What's your current situation?"
            value={formData.job_search_status}
            onChange={(e) => updateField('job_search_status', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Notice Period"
              options={NOTICE_PERIODS}
              placeholder="How soon can you join?"
              value={formData.notice_period}
              onChange={(e) => updateField('notice_period', e.target.value)}
            />
            <Input
              label="Preferred Locations"
              placeholder="Bangalore, Remote, Hyderabad..."
              value={formData.preferred_locations}
              onChange={(e) => updateField('preferred_locations', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="relocate"
              checked={formData.willing_to_relocate}
              onChange={(e) => updateField('willing_to_relocate', e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-pulse-600 focus:ring-pulse-500"
            />
            <label htmlFor="relocate" className="text-sm text-slate-300">
              I&apos;m willing to relocate for the right opportunity
            </label>
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Compensation (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Salary (LPA)"
              type="number"
              placeholder="e.g. 6"
              value={formData.salary_min}
              onChange={(e) => updateField('salary_min', e.target.value)}
              hint="Lakhs per annum"
            />
            <Input
              label="Maximum Salary (LPA)"
              type="number"
              placeholder="e.g. 12"
              value={formData.salary_max}
              onChange={(e) => updateField('salary_max', e.target.value)}
              hint="Lakhs per annum"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Work Preferences
          </h3>

          <ChipGroup
            label="Preferred Company Size"
            options={COMPANY_SIZES}
            selected={formData.preferred_company_sizes}
            onChange={(selected) => updateField('preferred_company_sizes', selected)}
            hint="Select all that interest you"
          />

          <ChipGroup
            label="Preferred Industries"
            options={INDUSTRIES}
            selected={formData.preferred_industries}
            onChange={(selected) => updateField('preferred_industries', selected)}
            maxSelections={5}
            hint="Select up to 5 industries"
          />
        </div>

        <TipCard
          icon="🎯"
          title="Be specific, get matched"
          description="Recruiters use these preferences to filter candidates. The more specific you are, the more relevant the opportunities you'll receive."
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-2')}>
            ← Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-4')} size="lg">
            Next: Privacy & Trust
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
