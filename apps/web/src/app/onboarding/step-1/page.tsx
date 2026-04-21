'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Input, Select, ChipGroup, AvatarUpload, Button, TipCard } from '@/components/ui';
import { TARGET_ROLES, IDEAL_ENVIRONMENTS, DEGREE_OPTIONS, BRANCH_OPTIONS } from '@/types';

export default function OnboardingStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    professional_headline: '',
    location: '',
    college: '',
    degree: '',
    branch: '',
    graduation_year: '',
    target_roles: [] as string[],
    ideal_environment: [] as string[],
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (file: File) => {
    // TODO: Upload to Supabase storage
    const url = URL.createObjectURL(file);
    updateField('avatar_url', url);
  };

  const handleNext = () => {
    // TODO: Save to Supabase
    router.push('/onboarding/step-2');
  };

  const degreeOptions = DEGREE_OPTIONS.map((d) => ({ label: d, value: d }));
  const branchOptions = BRANCH_OPTIONS.map((b) => ({ label: b, value: b }));
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => ({
    label: String(currentYear + i - 1),
    value: String(currentYear + i - 1),
  }));

  return (
    <OnboardingShell currentStep={1} completedSteps={[]} profileData={formData}>
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2">
          {/* Segmented progress */}
          <div className="flex gap-1.5 mb-4">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= 1 ? 'bg-pulse-600' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">Step 1 of 5</p>
          <h2 className="text-3xl font-bold text-slate-800">Let&apos;s build your career passport</h2>
          <p className="text-slate-500 text-lg">
            We&apos;ll use this to match you with the right opportunities.
          </p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload
            currentUrl={formData.avatar_url || null}
            name={formData.full_name || 'User'}
            onUpload={handleAvatarUpload}
          />
        </div>

        {/* Personal Info */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-800">A bit about you</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Your name"
              placeholder="Rahul Kumar"
              value={formData.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Input
              label="Where are you based?"
              placeholder="Bangalore, India"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>

          <Input
            label="What describes you best?"
            placeholder="Full Stack Developer | React & Node.js"
            value={formData.professional_headline}
            onChange={(e) => updateField('professional_headline', e.target.value)}
            hint="This appears below your name on your public profile"
          />
        </div>

        {/* Education */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-800">Your education</h3>

          <Input
            label="Your college"
            placeholder="Search your institution..."
            value={formData.college}
            onChange={(e) => updateField('college', e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Degree"
              options={degreeOptions}
              placeholder="Select degree"
              value={formData.degree}
              onChange={(e) => updateField('degree', e.target.value)}
            />
            <Select
              label="Branch"
              options={branchOptions}
              placeholder="Select branch"
              value={formData.branch}
              onChange={(e) => updateField('branch', e.target.value)}
            />
            <Select
              label="Graduation year"
              options={yearOptions}
              placeholder="Select year"
              value={formData.graduation_year}
              onChange={(e) => updateField('graduation_year', e.target.value)}
            />
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-800">What you&apos;re looking for</h3>

          <ChipGroup
            label="Roles you're interested in"
            options={TARGET_ROLES}
            selected={formData.target_roles}
            onChange={(selected) => updateField('target_roles', selected)}
            maxSelections={3}
            hint="Pick up to 3 roles that match your goals"
          />

          <ChipGroup
            label="Ideal work environment"
            options={IDEAL_ENVIRONMENTS}
            selected={formData.ideal_environment}
            onChange={(selected) => updateField('ideal_environment', selected)}
            maxSelections={3}
            hint="What type of workplace excites you?"
          />
        </div>

        {/* Tip Card */}
        <TipCard
          title="A complete profile goes a long way"
          description="Candidates who fill out every field get 3x more recruiter views. Take a moment — it's worth it."
          variant="info"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/auth/login')}>
            Back
          </Button>
          <Button onClick={handleNext} size="lg">
            Save & continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
