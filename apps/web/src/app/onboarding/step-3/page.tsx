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
  { label: 'Startup (1-50)', value: 'startup' },
  { label: 'Growth (50-200)', value: 'growth' },
  { label: 'Mid-size (200-1000)', value: 'mid' },
  { label: 'Enterprise (1000+)', value: 'enterprise' },
];

const INDUSTRIES = [
  { label: 'SaaS / Cloud', value: 'saas' },
  { label: 'FinTech', value: 'fintech' },
  { label: 'EdTech', value: 'edtech' },
  { label: 'HealthTech', value: 'healthtech' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'AI / ML', value: 'ai_ml' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Social Media', value: 'social' },
  { label: 'Cybersecurity', value: 'security' },
  { label: 'Dev Tools', value: 'devtools' },
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
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2">
          {/* Segmented progress */}
          <div className="flex gap-1.5 mb-4">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= 3 ? 'bg-pulse-600' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">Step 3 of 5</p>
          <h2 className="text-3xl font-bold text-slate-800">Where are you headed?</h2>
          <p className="text-slate-500 text-lg">
            Help us understand your career goals so we can match you with the right opportunities.
          </p>
        </div>

        {/* Job Search Status */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-800">Current status</h3>

          <Select
            label="What's your job search status?"
            options={JOB_SEARCH_STATUS}
            placeholder="Select your current situation"
            value={formData.job_search_status}
            onChange={(e) => updateField('job_search_status', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="How soon can you join?"
              options={NOTICE_PERIODS}
              placeholder="Select notice period"
              value={formData.notice_period}
              onChange={(e) => updateField('notice_period', e.target.value)}
            />
            <Input
              label="Preferred locations"
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
              className="rounded border-slate-200 text-pulse-600 focus:ring-pulse-500"
            />
            <label htmlFor="relocate" className="text-sm text-slate-600">
              I&apos;m willing to relocate for the right opportunity
            </label>
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-800">Expected compensation <span className="text-slate-400 font-normal">(optional)</span></h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum salary (LPA)"
              type="number"
              placeholder="e.g. 6"
              value={formData.salary_min}
              onChange={(e) => updateField('salary_min', e.target.value)}
              hint="Lakhs per annum"
            />
            <Input
              label="Maximum salary (LPA)"
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
          <h3 className="text-sm font-semibold text-slate-800">Work preferences</h3>

          <ChipGroup
            label="Preferred company size"
            options={COMPANY_SIZES}
            selected={formData.preferred_company_sizes}
            onChange={(selected) => updateField('preferred_company_sizes', selected)}
            hint="Select all that interest you"
          />

          <ChipGroup
            label="Industries you'd like to explore"
            options={INDUSTRIES}
            selected={formData.preferred_industries}
            onChange={(selected) => updateField('preferred_industries', selected)}
            maxSelections={5}
            hint="Pick up to 5 industries"
          />
        </div>

        <TipCard
          title="Specificity helps"
          description="Recruiters use these preferences to filter candidates. The more specific you are, the more relevant the opportunities you'll receive."
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-2')}>
            Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-4')} size="lg">
            Save & continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
