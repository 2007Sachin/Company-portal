'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Github,
  Code2,
  Video,
  Loader2,
  Sparkles,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { createCandidate } from '@/lib/api';

// ── Suggested skills ───────────────────────────────────────
const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'Go',
  'Java', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL',
  'MongoDB', 'GraphQL', 'Next.js', 'FastAPI', 'Express',
  'Redis', 'Kafka', 'Rust', 'Swift', 'Flutter',
];

const NOTICE_OPTIONS = [
  { label: 'Immediate', value: 0 },
  { label: '15 Days', value: 15 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

// ── Types ──────────────────────────────────────────────────
interface OnboardingData {
  headline: string;
  location: string;
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  github_username: string;
  leetcode_verified: boolean;
  leetcode_username: string;
  has_video_pitch: boolean;
}

// ── Progress Indicator ─────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Skills' },
    { num: 3, label: 'Verify' },
  ];

  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <React.Fragment key={step.num}>
            {i > 0 && (
              <div
                className={`h-px w-10 sm:w-16 transition-colors duration-300 ${
                  isCompleted ? 'bg-indigo-500' : 'bg-slate-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.num}
              </div>
              <span
                className={`text-xs font-semibold transition-colors duration-300 ${
                  isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Basics ─────────────────────────────────────────
function StepBasics({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
          <Briefcase className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tell us about yourself</h2>
        <p className="text-slate-500 mt-1 text-sm">This helps recruiters understand what you&apos;re looking for</p>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <label htmlFor="headline" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Professional Headline
        </label>
        <input
          id="headline"
          type="text"
          placeholder="e.g. Full Stack Developer | React + Node.js"
          value={data.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <p className="text-xs text-slate-400">Make it catchy — this is the first thing recruiters see</p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          Location
        </label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Bengaluru, India or Remote"
          value={data.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Experience + Notice Period Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            Experience (Years)
          </label>
          <input
            id="experience"
            type="number"
            min={0}
            max={50}
            value={data.experience_years}
            onChange={(e) => onChange({ experience_years: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="notice" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Notice Period
          </label>
          <div className="relative">
            <select
              id="notice"
              value={data.notice_period_days}
              onChange={(e) => onChange({ notice_period_days: parseInt(e.target.value) })}
              className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {NOTICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Skills ─────────────────────────────────────────
function StepSkills({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const [customInput, setCustomInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleSkill = useCallback(
    (skill: string) => {
      const current = data.skills;
      if (current.includes(skill)) {
        onChange({ skills: current.filter((s) => s !== skill) });
      } else {
        onChange({ skills: [...current, skill] });
      }
    },
    [data.skills, onChange]
  );

  const addCustomSkill = useCallback(() => {
    const trimmed = customInput.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      onChange({ skills: [...data.skills, trimmed] });
      setCustomInput('');
    }
  }, [customInput, data.skills, onChange]);

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (s) => s.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
          <Code2 className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">What&apos;s in your stack?</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Select your skills — these drive your match score with job descriptions
        </p>
      </div>

      {/* Selected Skills */}
      {data.skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Selected ({data.skills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors group"
              >
                {skill}
                <X className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Popular Skills</p>
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((skill) => {
            const isSelected = data.skills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                )}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Skill Input */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Custom Skill</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Terraform, Figma, Solidity..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            onClick={addCustomSkill}
            disabled={!customInput.trim()}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Verify ─────────────────────────────────────────
function StepVerify({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const [activeModal, setActiveModal] = useState<'github' | 'leetcode' | null>(null);
  const [modalInput, setModalInput] = useState('');

  const handleVerify = () => {
    if (!modalInput.trim()) return;

    if (activeModal === 'github') {
      onChange({ github_verified: true, github_username: modalInput.trim() });
    } else if (activeModal === 'leetcode') {
      onChange({ leetcode_verified: true, leetcode_username: modalInput.trim() });
    }
    setModalInput('');
    setActiveModal(null);
  };

  const signals = [
    {
      key: 'github' as const,
      label: 'GitHub',
      description: 'Verify your open-source contributions and coding activity',
      icon: Github,
      verified: data.github_verified,
      username: data.github_username,
      color: 'slate',
      bgGradient: 'from-slate-800 to-slate-900',
    },
    {
      key: 'leetcode' as const,
      label: 'LeetCode',
      description: 'Showcase your problem-solving skills and contest ratings',
      icon: Code2,
      verified: data.leetcode_verified,
      username: data.leetcode_username,
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-600',
    },
    {
      key: 'video' as const,
      label: 'Video Pitch',
      description: 'Record a 60-second intro to stand out from the crowd',
      icon: Video,
      verified: data.has_video_pitch,
      username: '',
      color: 'blue',
      bgGradient: 'from-blue-500 to-indigo-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
          <Sparkles className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Boost your Pulse Score</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Connect platforms to verify your skills — each one increases your visibility
        </p>
      </div>

      <div className="space-y-4">
        {signals.map((signal) => (
          <div
            key={signal.key}
            className={`p-5 rounded-2xl border transition-all duration-200 ${
              signal.verified
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${signal.bgGradient} flex items-center justify-center shadow-md flex-shrink-0`}
              >
                <signal.icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{signal.label}</h3>
                  {signal.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      <Check className="w-3 h-3" strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{signal.description}</p>
                {signal.verified && signal.username && (
                  <p className="text-sm font-medium text-slate-700 mt-1.5">
                    Connected as <span className="text-indigo-600 font-semibold">@{signal.username}</span>
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {signal.key === 'video' ? (
                  <button
                    className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    disabled
                  >
                    Record Later
                  </button>
                ) : signal.verified ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveModal(signal.key);
                      setModalInput('');
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        You can skip verification for now and connect later from your dashboard
      </p>

      {/* ── Verification Modal ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Connect {activeModal === 'github' ? 'GitHub' : 'LeetCode'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="platform-username" className="text-sm font-semibold text-slate-700">
                {activeModal === 'github' ? 'GitHub' : 'LeetCode'} Username
              </label>
              <input
                id="platform-username"
                type="text"
                placeholder={activeModal === 'github' ? 'e.g. rahul-dev' : 'e.g. rahul_codes'}
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
                autoFocus
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <p className="text-xs text-slate-400">
                We&apos;ll verify your profile and pull activity data
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={!modalInput.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Verify & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Onboarding Page ───────────────────────────────────
export default function CandidateOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    headline: '',
    location: '',
    experience_years: 0,
    notice_period_days: 0,
    skills: [],
    github_verified: false,
    github_username: '',
    leetcode_verified: false,
    leetcode_username: '',
    has_video_pitch: false,
  });

  const handleChange = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Validation per step
  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return data.headline.trim().length >= 3 && data.location.trim().length >= 2;
      case 2:
        return data.skills.length >= 1;
      case 3:
        return true; // verification is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createCandidate({
        headline: data.headline,
        location: data.location,
        experience_years: data.experience_years,
        notice_period_days: data.notice_period_days,
        skills: data.skills,
        github_verified: data.github_verified,
        leetcode_verified: data.leetcode_verified,
        has_video_pitch: data.has_video_pitch,
      });

      router.push('/candidate/dashboard');
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header title="Complete your profile" />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress */}
        <StepIndicator currentStep={step} />

        {/* Step Content Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {step === 1 && <StepBasics data={data} onChange={handleChange} />}
          {step === 2 && <StepSkills data={data} onChange={handleChange} />}
          {step === 3 && <StepVerify data={data} onChange={handleChange} />}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    Launch My Profile
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pulse Score Preview */}
        <div className="mt-6 p-4 rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Estimated Pulse Score</p>
          <p className="text-3xl font-black text-indigo-600 tracking-tight">
            {calculateEstimatedScore(data)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Complete more steps to increase your score</p>
        </div>
      </main>
    </div>
  );
}

// ── Score estimator (mirrors backend logic) ────────────────
function calculateEstimatedScore(data: OnboardingData): number {
  let score = 50;
  if (data.github_verified) score += 20;
  if (data.leetcode_verified) score += 15;
  if (data.has_video_pitch) score += 10;
  score += Math.min(data.skills.length * 5, 25);
  return Math.min(score, 100);
}
