'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Target,
  Globe,
  Wallet,
  GraduationCap,
  Play,
  Square,
  ShieldCheck,
  Rocket,
  Camera,
  Trash2,
  Shield,
  Eye,
  Lock,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getCandidateMe,
  updateCandidateProfileV2,
  updateCandidateGoalsV2,
  getStorageSignedUploadUrlV2,
  runProfileOptimizerAgent,
  runGithubCuratorAgent,
  createCandidateCaseStudy,
  getCandidateCaseStudies,
  deleteCandidateCaseStudy
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

interface CaseStudy {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
}

interface OnboardingState {
  // Step 1
  full_name: string;
  phone: string;
  city: string;
  college_name: string;
  graduation_year: number;
  headline: string;
  profile_photo_url: string;

  // Step 2
  github_username: string;
  leetcode_username: string;
  case_studies: CaseStudy[];
  video_url: string;
  skills: string[];

  // Step 3
  target_roles: string[];
  target_locations: string[];
  expected_ctc_min: number;
  expected_ctc_max: number;
  preferred_work_setup: string[];
  notice_period_days: number;

  // Step 4
  profile_visibility: 'public' | 'private' | 'hidden';
  data_consent: boolean;
  allow_recruiter_contact: boolean;
}

// ── Components ─────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Evidence' },
    { num: 3, label: 'Goals' },
    { num: 4, label: 'Control' },
    { num: 5, label: 'Liftoff' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-700" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              currentStep >= s.num ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border-2 border-slate-100 text-slate-400'
            }`}>
              {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`absolute -bottom-6 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
              currentStep >= s.num ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    full_name: '',
    phone: '',
    city: '',
    college_name: '',
    graduation_year: new Date().getFullYear(),
    headline: '',
    profile_photo_url: '',
    github_username: '',
    leetcode_username: '',
    case_studies: [],
    video_url: '',
    skills: [],
    target_roles: [],
    target_locations: [],
    expected_ctc_min: 10,
    expected_ctc_max: 25,
    preferred_work_setup: ['Remote'],
    notice_period_days: 30,
    profile_visibility: 'public',
    data_consent: false,
    allow_recruiter_contact: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await getCandidateMe();
        if (res.ok) {
          const d = await res.json();
          const csRes = await getCandidateCaseStudies();
          const cs = csRes.ok ? (await csRes.json()).case_studies : [];
          
          setState(prev => ({
            ...prev,
            full_name: d.full_name || '',
            phone: d.phone || '',
            city: d.city || d.location || '',
            college_name: d.college_name || '',
            graduation_year: d.graduation_year || prev.graduation_year,
            headline: d.headline || '',
            profile_photo_url: d.profile_photo_url || '',
            github_username: d.github_username || '',
            leetcode_username: d.leetcode_username || '',
            skills: d.skills || [],
            case_studies: cs,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 1) {
        await updateCandidateProfileV2({
          full_name: state.full_name,
          phone: state.phone,
          city: state.city,
          college_name: state.college_name,
          graduation_year: state.graduation_year,
          headline: state.headline,
          profile_photo_url: state.profile_photo_url,
        });
      } else if (step === 2) {
        await updateCandidateProfileV2({
          github_username: state.github_username,
          leetcode_username: state.leetcode_username,
          skills: state.skills,
        });
      } else if (step === 3) {
        await updateCandidateGoalsV2({
          target_roles: state.target_roles,
          target_locations: state.target_locations,
          expected_ctc_min: state.expected_ctc_min,
          expected_ctc_max: state.expected_ctc_max,
          preferred_work_setup: state.preferred_work_setup,
          notice_period_days: state.notice_period_days,
          what_learning: [], // placeholder if needed
        });
      } else if (step === 4) {
        await updateCandidateProfileV2({
          profile_visibility: state.profile_visibility,
          data_consent: state.data_consent,
          allow_recruiter_contact: state.allow_recruiter_contact,
        });
      } else if (step === 5) {
        localStorage.setItem('has_seen_welcome_v2', 'true');
        router.push('/candidate/dashboard');
        return;
      }
      setStep(s => s + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Onboarding Wizard" backTo="/candidate/dashboard" />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Build Your Pulse.</h1>
          <p className="text-slate-500 font-medium">Verified proof, better matches, faster tech hiring.</p>
        </header>

        <StepIndicator currentStep={step} />

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 p-8 md:p-12 relative overflow-hidden">
          <div className="min-h-[450px]">
            {step === 1 && <Step1 state={state} setState={setState} />}
            {step === 2 && <Step2 state={state} setState={setState} />}
            {step === 3 && <Step3 state={state} setState={setState} />}
            {step === 4 && <Step4 state={state} setState={setState} />}
            {step === 5 && <Step5 state={state} />}
          </div>

          <footer className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-50 active:scale-95'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button 
              onClick={handleNext}
              disabled={saving || !isStepValid(step, state)}
              className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {step === 5 ? 'Enter Cockpit' : 'Next Step'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}

function isStepValid(step: number, state: OnboardingState) {
  if (step === 1) return !!state.full_name && !!state.headline && !!state.city;
  if (step === 2) return true; // Most are optional for now logic
  if (step === 3) return state.target_roles.length > 0;
  if (step === 4) return state.data_consent;
  return true;
}

// ── STEP 1: WHO YOU ARE ───────────────────────────────────

function Step1({ state, setState }: any) {
  const [suggesting, setSuggesting] = useState(false);

  const suggestHeadline = async () => {
    setSuggesting(true);
    try {
      const res = await runProfileOptimizerAgent({
        headline: state.headline,
        college_name: state.college_name,
        city: state.city
      });
      if (res.ok) {
        const d = await res.json();
        if (d.suggested_headline) setState((s: any) => ({ ...s, headline: d.suggested_headline }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileName = `profile_${Date.now()}_${file.name}`;
      const signRes = await getStorageSignedUploadUrlV2('profile-photos', fileName, file.type);
      if (signRes.ok) {
        const { signedUrl, path } = await signRes.json();
        await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setState((s: any) => ({ ...s, profile_photo_url: path }));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Photo Upload */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative">
            {state.profile_photo_url ? (
              <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${state.profile_photo_url}`} className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-slate-300" />
            )}
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} accept="image/*" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 text-center">Add Photo</p>
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                value={state.full_name} 
                onChange={e => setState((s: any) => ({ ...s, full_name: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold"
                placeholder="Rahul Sharma"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current City</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  value={state.city} 
                  onChange={e => setState((s: any) => ({ ...s, city: e.target.value }))}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
                  placeholder="Bengaluru, India"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between items-center">
              Professional Headline
              <button onClick={suggestHeadline} className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Rewrite with AI
              </button>
            </label>
            <textarea 
              value={state.headline} 
              onChange={e => setState((s: any) => ({ ...s, headline: e.target.value }))}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-24 resize-none outline-none font-bold"
              placeholder="Fullstack Engineer specializing in React and Node.js..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">College/University</label>
              <input 
                value={state.college_name} 
                onChange={e => setState((s: any) => ({ ...s, college_name: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
                placeholder="IIT Delhi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Graduation Year</label>
              <input 
                type="number"
                value={state.graduation_year} 
                onChange={e => setState((s: any) => ({ ...s, graduation_year: parseInt(e.target.value) }))}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold"
                placeholder="2025"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 2: SHOW WHAT YOU'VE BUILT ──────────────────────────

function Step2({ state, setState }: any) {
  const [curating, setCurating] = useState(false);
  const [csTitle, setCsTitle] = useState('');

  const runCurator = async () => {
    setCurating(true);
    try {
      const res = await runGithubCuratorAgent();
      if (res.ok) {
        // Just for effect in wizard
      }
    } catch (e) { console.error(e); }
    finally { setCurating(false); }
  };

  const addCaseStudy = async () => {
    if (!csTitle) return;
    try {
      const res = await createCandidateCaseStudy({ title: csTitle });
      if (res.ok) {
        const d = await res.json();
        setState((s: any) => ({ ...s, case_studies: [...s.case_studies, d] }));
        setCsTitle('');
      }
    } catch (e) { console.error(e); }
  };

  const removeCaseStudy = async (id: string) => {
    try {
      await deleteCandidateCaseStudy(id);
      setState((s: any) => ({ ...s, case_studies: s.case_studies.filter((c: any) => c.id !== id) }));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Evidence Bases</h3>
          
          <div className="space-y-4">
            <div className="p-5 border-2 border-slate-100 rounded-3xl bg-slate-50 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">GitHub</p>
                  <input 
                    value={state.github_username}
                    onChange={e => setState((s: any) => ({ ...s, github_username: e.target.value }))}
                    placeholder="Username"
                    className="bg-transparent border-none p-0 text-xs font-medium text-slate-400 outline-none"
                  />
                </div>
              </div>
              <button onClick={runCurator} disabled={!state.github_username || curating} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {curating ? 'Curating...' : 'Curate Repos'}
              </button>
            </div>

            <div className="p-5 border-2 border-slate-100 rounded-3xl bg-slate-50 hover:border-amber-500/30 transition-all flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">LeetCode</p>
                <input 
                  value={state.leetcode_username}
                  onChange={e => setState((s: any) => ({ ...s, leetcode_username: e.target.value }))}
                  placeholder="Username"
                  className="bg-transparent border-none p-0 text-xs font-medium text-slate-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm">60s Intro Video</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Highly Recommended</p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-all">Record Video</button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Project Showcase</h3>
          <div className="space-y-3">
            {state.case_studies.map((cs: any) => (
              <div key={cs.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
                <span className="text-sm font-bold text-slate-700">{cs.title}</span>
                <button onClick={() => removeCaseStudy(cs.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input 
                value={csTitle}
                onChange={e => setCsTitle(e.target.value)}
                placeholder="Case study title..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
              />
              <button onClick={addCaseStudy} className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3: WHERE DO YOU WANT TO GO ────────────────────────

function Step3({ state, setState }: any) {
  const rolesOptions = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Mobile Dev', 'DevOps', 'Product Manager'];
  const locationsOptions = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Remote'];
  const setupOptions = ['Remote', 'Hybrid', 'On-site'];

  const toggleItem = (list: string[], item: string, key: string) => {
    const next = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setState((s: any) => ({ ...s, [key]: next }));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Roles</label>
            <div className="flex flex-wrap gap-2">
              {rolesOptions.map(r => (
                <button 
                  key={r}
                  onClick={() => toggleItem(state.target_roles, r, 'target_roles')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    state.target_roles.includes(r) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Locations</label>
            <div className="flex flex-wrap gap-2">
              {locationsOptions.map(l => (
                <button 
                  key={l}
                  onClick={() => toggleItem(state.target_locations, l, 'target_locations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    state.target_locations.includes(l) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Expected CTC (LPA)</label>
              <span className="text-sm font-black text-indigo-600">{state.expected_ctc_min}L - {state.expected_ctc_max}L+</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="range" min="1" max="50" step="1" 
                value={state.expected_ctc_min} 
                onChange={e => setState((s: any) => ({ ...s, expected_ctc_min: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input 
                type="range" min="5" max="100" step="1" 
                value={state.expected_ctc_max} 
                onChange={e => setState((s: any) => ({ ...s, expected_ctc_max: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Work Setup</label>
            <div className="flex gap-2">
              {setupOptions.map(o => (
                <button 
                  key={o}
                  onClick={() => toggleItem(state.preferred_work_setup, o, 'preferred_work_setup')}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    state.preferred_work_setup.includes(o) ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 4: IN CONTROL ─────────────────────────────────────

function Step4({ state, setState }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trust & Visibility.</h2>
      <p className="text-slate-500 font-medium leading-relaxed">Pulse is built on transparency. Control exactly who sees your proof-of-work signals.</p>

      <div className="space-y-4 text-left mt-10">
        <div className={`p-6 border-2 rounded-3xl cursor-pointer transition-all ${state.profile_visibility === 'public' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => setState((s: any) => ({ ...s, profile_visibility: 'public' }))}>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-900">
               <Eye className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-slate-900">Public Profile</p>
               <p className="text-xs text-slate-400">Discoverable by all verified recruiters on the platform.</p>
             </div>
          </div>
        </div>

        <div className={`p-6 border-2 rounded-3xl cursor-pointer transition-all ${state.profile_visibility === 'hidden' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`} onClick={() => setState((s: any) => ({ ...s, profile_visibility: 'hidden' }))}>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-900">
               <Lock className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-slate-900">Hidden from Search</p>
               <p className="text-xs text-slate-400">Recruiters can only see you if you express interest in their role.</p>
             </div>
          </div>
        </div>

        <div className="pt-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-1 w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${state.data_consent ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-500'}`}>
              <Check className="w-4 h-4 text-white" strokeWidth={4} />
            </div>
            <input type="checkbox" className="hidden" checked={state.data_consent} onChange={() => setState((s: any) => ({ ...s, data_consent: !s.data_consent }))} />
            <span className="text-xs font-bold text-slate-500 leading-normal">
              I agree to the Pulse Data Processing Policy. I understand that my GitHub and LeetCode activity will be analyzed to compute my Pulse Score.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── STEP 5: LIFTOFF ────────────────────────────────────────

function Step5({ state }: { state: OnboardingState }) {
  return (
    <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white relative z-10 mx-auto transform hover:rotate-12 transition-transform duration-500 shadow-2xl">
          <Rocket className="w-14 h-14" />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">You&apos;re Ready to Launch.</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">Your proof-of-work profile is being indexed. In a few minutes, you&apos;ll appear in recruiter radars across the ecosystem.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Baseline</p>
           <p className="text-xl font-black text-slate-900">54.2</p>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signals</p>
           <p className="text-xl font-black text-slate-900">{state.skills.length + (state.github_username ? 1 : 0) + (state.leetcode_username ? 1 : 0)}</p>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential</p>
           <p className="text-xl font-black text-emerald-600">85+</p>
        </div>
      </div>
    </div>
  );
}
