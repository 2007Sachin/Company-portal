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
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <span className="text-xs font-semibold text-pulse-400 uppercase tracking-wider">Step 1 of 5</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-white">Who You Are</h2>
          <p className="text-slate-400 text-lg">
            Let&apos;s set up your identity. Make your first impression count ✨
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
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Rahul Kumar"
              value={formData.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Input
              label="Location"
              placeholder="Bangalore, India"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>

          <Input
            label="Professional Headline"
            placeholder="Full Stack Developer | React & Node.js"
            value={formData.professional_headline}
            onChange={(e) => updateField('professional_headline', e.target.value)}
            hint="This appears below your name on your public profile"
          />
        </div>

        {/* Education */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            Education
          </h3>

          <Input
            label="College / University"
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
              label="Branch / Major"
              options={branchOptions}
              placeholder="Select branch"
              value={formData.branch}
              onChange={(e) => updateField('branch', e.target.value)}
            />
            <Select
              label="Graduation Year"
              options={yearOptions}
              placeholder="Select year"
              value={formData.graduation_year}
              onChange={(e) => updateField('graduation_year', e.target.value)}
            />
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-px bg-slate-700" />
            What You&apos;re Looking For
          </h3>

          <ChipGroup
            label="Target Roles"
            options={TARGET_ROLES}
            selected={formData.target_roles}
            onChange={(selected) => updateField('target_roles', selected)}
            maxSelections={3}
            hint="Select up to 3 roles you're targeting"
          />

          <ChipGroup
            label="Ideal Work Environment"
            options={IDEAL_ENVIRONMENTS}
            selected={formData.ideal_environment}
            onChange={(selected) => updateField('ideal_environment', selected)}
            maxSelections={3}
            hint="What type of workplace excites you?"
          />
        </div>

        {/* Tip Card */}
        <TipCard
          icon="💡"
          title="Make it stand out"
          description="Candidates with complete profiles and professional photos get 3x more recruiter views. Take a moment to fill out every field!"
          variant="info"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Autosaved
          </div>
          <Button onClick={handleNext} size="lg">
            Next: Proof of Work
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
