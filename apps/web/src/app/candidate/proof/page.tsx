'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  FileText, 
  Mic, 
  Award, 
  Video, 
  ChevronRight, 
  Star, 
  Plus, 
  Trash2, 
  Share2, 
  Play, 
  RefreshCcw, 
  Sparkles, 
  Check, 
  X,
  Loader2,
  Clock,
  ExternalLink,
  Target,
  CheckCircle2,
  Code,
  Zap,
  TrendingUp,
  Eye,
  Shield,
  Copy,
  Layout,
  Terminal,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getMyGithubRepos, 
  updateGithubRepo, 
  copilotGenerateReadme,
  getMyCaseStudies,
  createCaseStudy,
  deleteCaseStudy,
  getUploadUrl,
  getMySkillAssessments,
  copilotStartAssessment,
  copilotGradeAssessment,
  submitSkillAssessment,
  getMyVideoPitch,
  upsertVideoPitch,
  getCandidateMe
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

type TabType = 'code' | 'logic' | 'impact' | 'pitch' | 'radar';

// ── Components ─────────────────────────────────────────────

export default function ProofBuilderPage() {
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCandidateMe();
        if (res.ok) setProfile(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [activeTab]);

  const tabs = [
    { id: 'code', label: 'Codebase', icon: Terminal, desc: 'GitHub Evidence' },
    { id: 'logic', label: 'Logic', icon: Code, desc: 'Skill Verifications' },
    { id: 'impact', label: 'Impact', icon: Layout, desc: 'Case Studies' },
    { id: 'pitch', label: 'Pitch', icon: Video, desc: 'Video Intro' },
    { id: 'radar', label: 'Radar', icon: Target, desc: 'Visibility & Links' },
  ];

  if (loading && !profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Proof Builder" backTo="/candidate/dashboard" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-80 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
              <div className="text-center mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pulse Score Mastery</p>
                <div className="relative inline-block">
                  <span className="text-6xl font-black text-slate-900">{profile?.pulse_score || 0}</span>
                  <span className="absolute -top-1 -right-8 px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">PRO</span>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full group flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-xl shadow-slate-300 translate-x-2' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black tracking-tight">{tab.label}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{tab.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden">
               <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
               <h4 className="text-lg font-black tracking-tight relative z-10">Score Coach</h4>
               <p className="text-xs text-indigo-100 leading-relaxed relative z-10 font-medium">Add a 60s Video Pitch to increase your Pulse Score by 12 points instantly.</p>
               <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg shadow-indigo-700/20 relative z-10 hover:scale-105 transition-transform">Get Targeted Advice</button>
            </div>
          </aside>

          {/* Tab Content */}
          <section className="flex-1 min-h-[600px]">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {activeTab === 'code' && <CodeTab />}
              {activeTab === 'logic' && <LogicTab />}
              {activeTab === 'impact' && <ImpactTab />}
              {activeTab === 'pitch' && <PitchTab />}
              {activeTab === 'radar' && <RadarTab profile={profile} />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ── CODE TAB ──────────────────────────────────────────────

function CodeTab() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readmePreview, setReadmePreview] = useState<any>(null);
  const [genId, setGenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const res = await getMyGithubRepos();
      if (res.ok) setRepos(await res.json());
      setLoading(false);
    }
    fetch();
  }, []);

  const handleGen = async (id: string, url: string) => {
    setGenId(id);
    const res = await copilotGenerateReadme(url);
    if (res.ok) {
      const d = await res.json();
      setReadmePreview({ id, markdown: d.markdown });
    }
    setGenId(null);
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await updateGithubRepo(id, { is_featured: !current });
    setRepos(prev => prev.map(r => r.id === id ? { ...r, is_featured: !current } : r));
  };

  if (loading) return <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Codebase Evidence</h2>
        <button onClick={() => window.location.reload()} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {repos.map(r => (
          <div key={r.id} className="group bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                    <Github className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{r.repo_name}</h3>
                  {r.is_featured && <Star className="w-5 h-5 text-amber-400 fill-current" />}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {r.inferred_skills?.map((s: string) => (
                    <span key={s} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">{s}</span>
                  ))}
                </div>

                <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {r.stars} Stars</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> {r.commit_count_30d || 0} Commit Streak (30d)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                 <button 
                  onClick={() => handleGen(r.id, r.repo_url)}
                  disabled={!!genId}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-colors"
                 >
                   {genId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                   {r.ai_generated_readme ? 'Update README' : 'Generate AI README'}
                 </button>
                 <button 
                  onClick={() => toggleFeatured(r.id, r.is_featured)}
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${r.is_featured ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                 >
                   {r.is_featured ? 'Featured' : 'Mark Featured'}
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {readmePreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                     <Sparkles className="w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">Project README</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Agent Generation</p>
                   </div>
                </div>
                <button onClick={() => setReadmePreview(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-300" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm font-mono text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                   {readmePreview.markdown}
                 </div>
              </div>
              <div className="p-10 border-t border-slate-100 flex justify-end gap-4">
                 <button onClick={() => setReadmePreview(null)} className="px-8 py-4 text-slate-400 font-black text-sm">Dismiss</button>
                 <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl">Update Repo</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// ── LOGIC TAB ─────────────────────────────────────────────

function LogicTab() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getMySkillAssessments();
      if (res.ok) setAssessments(await res.json());
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Logic & Skill Verification</h2>
        <button className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-sm hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 flex items-center gap-2">
          <Award className="w-5 h-5" /> Take New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LeetCode Integration */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
               <Zap className="w-7 h-7" />
             </div>
             <div>
               <h4 className="text-lg font-black text-slate-900">LeetCode Sync</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verified via Agent</p>
             </div>
           </div>
           <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Connect</button>
        </div>

        {/* GitHub Contribution Heatmap Simulation */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <h4 className="text-sm font-black text-slate-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Commits Stability</h4>
           <div className="flex gap-1">
             {[...Array(20)].map((_, i) => (
               <div key={i} className={`h-4 w-4 rounded-sm ${i % 3 === 0 ? 'bg-emerald-500' : i % 2 === 0 ? 'bg-emerald-100' : 'bg-slate-100'}`} />
             ))}
           </div>
           <p className="text-[10px] font-bold text-slate-400">72% consistency over 90 days. Top 5% of candidate pool.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map(a => (
          <div key={a.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm border-b-8 border-b-emerald-500 relative overflow-hidden">
             <Sparkles className="absolute -top-4 -right-4 w-16 h-16 text-emerald-50 opacity-50" />
             <div className="space-y-4 relative z-10">
               <div className="p-3 bg-emerald-50 rounded-xl w-fit">
                 <Award className="w-6 h-6 text-emerald-600" />
               </div>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">{a.skill}</h4>
               <div className="flex items-center justify-between">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</p>
                 <p className="text-2xl font-black text-slate-900">{a.score}%</p>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── IMPACT TAB ────────────────────────────────────────────

function ImpactTab() {
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getMyCaseStudies();
      if (res.ok) setStudies(await res.json());
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Impact & Case Studies</h2>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Case Study
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {studies.map(s => (
          <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 hover:shadow-2xl transition-all group">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{s.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{s.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.skills?.map((sk: string) => (
                  <span key={sk} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">{sk}</span>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                 <button className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-800">
                   <ChevronRight className="w-4 h-4" /> Full View
                 </button>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PITCH TAB ─────────────────────────────────────────────

function PitchTab() {
  const [pitch, setPitch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const res = await getMyVideoPitch();
      if (res.ok) setPitch(await res.json());
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">The 60s Elevate Pitch</h2>
        <p className="text-slate-500 font-medium mt-2">A video pitch proves your communication skills and culture alignment instantly.</p>
      </div>

      <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl group">
        {pitch?.video_url ? (
          <video src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/video-pitches/${pitch.video_url}`} controls className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-4">No video pitch recorded.</h3>
            <button className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" /> Record Now
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-[2rem] border border-slate-100 space-y-4">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> AI Transcript Insights</h4>
           <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"Candidate demonstrated strong architectural focus and mentioned scaling challenges with Microservices."</p>
        </div>
        <div className="p-8 bg-emerald-900 rounded-[2rem] text-white space-y-4">
           <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Mic className="w-4 h-4 text-emerald-400" /> Audio Quality</h4>
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-bold">Clear audio signals. Recruiter ready.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// ── RADAR TAB ─────────────────────────────────────────────

function RadarTab({ profile }: { profile: any }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `https://pulse.sh/${profile?.full_name?.toLowerCase().replace(/\s/g, '-') || 'profile'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recruiter Radar</h2>
        <p className="text-slate-500 font-medium mt-2">Control how the world sees your proof-of-work signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
           <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Visibility Status</h4>
             <div className="flex gap-3">
                {['Public', 'Hidden', 'Private'].map(v => (
                  <button 
                    key={v}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${profile?.profile_visibility === v.toLowerCase() ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {v}
                  </button>
                ))}
             </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <Shield className="w-10 h-10 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-black text-slate-900">Privacy Safeguard</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Your exact location and contact details are only visible to recruiters you've engaged with.</p>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
           <Eye className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
           <div className="relative z-10 space-y-8">
             <div className="space-y-2">
               <h4 className="text-2xl font-black tracking-tight">Public Profile Link</h4>
               <p className="text-slate-400 text-sm font-medium">Share your proof-of-work on LinkedIn or X.</p>
             </div>
             
             <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <span className="flex-1 text-xs font-mono text-indigo-200 truncate">{publicUrl}</span>
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-white text-slate-900 rounded-xl hover:scale-105 transition-transform"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>

             <div className="flex items-center gap-4 pt-4">
               <button className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2">
                 <Share2 className="w-4 h-4" /> Share Link
               </button>
               <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2">
                 <Eye className="w-4 h-4" /> Preview
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
