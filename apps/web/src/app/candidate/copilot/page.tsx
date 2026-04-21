'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Target, 
  Video, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Zap,
  Bot,
  Loader2,
  Trash2,
  Check,
  X,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getCandidateMe, 
  runProfileOptimizerAgent, 
  runScoreCoachAgent, 
  runMockInterviewAgent,
  getCandidateMatchesV2,
  updateCandidateProfileV2,
} from '@/lib/api';

type Tab = 'optimizer' | 'coach' | 'mock' | 'radar';

export default function CopilotHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('optimizer');
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCandidateMe();
      if (res.ok) setCandidate(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const agents = [
    { id: 'optimizer', label: 'Profile Optimizer', icon: Sparkles, color: 'text-indigo-600', desc: 'AI Rewrite & SEO' },
    { id: 'coach', label: 'Score Coach', icon: Target, color: 'text-amber-500', desc: 'Score Action Plan' },
    { id: 'mock', label: 'Mock Interview', icon: Bot, color: 'text-rose-500', desc: 'Skill Drills' },
    { id: 'radar', label: 'Opportunity Radar', icon: Eye, color: 'text-emerald-500', desc: 'Match Insights' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Pulse Co-pilot" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/*sidebar */}
          <aside className="w-full md:w-80 space-y-3">
            <h2 className="text-2xl font-black text-slate-900 mb-6 px-2">Agent Central.</h2>
            {agents.map(a => {
              const isActive = activeTab === a.id;
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveTab(a.id as Tab)}
                  className={`w-full group flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-2xl shadow-slate-200 border border-slate-100 text-slate-900' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left font-black tracking-tight">
                    <p className="text-sm">{a.label}</p>
                    <p className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>{a.desc}</p>
                  </div>
                </button>
              );
            })}

            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
               <BrainCircuit className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500/20" />
               <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">System Status</p>
               <h4 className="text-lg font-black mb-4">Neural Engine Active</h4>
               <p className="text-[10px] text-slate-400 leading-relaxed">Your agents are continuously scanning GitHub, LeetCode, and recruiter demand to keep your Pulse optimized.</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="flex-1 min-h-[700px]">
             <div className="animate-in fade-in slide-in-from-right-8 duration-700">
               {activeTab === 'optimizer' && <OptimizerHub candidate={candidate} />}
               {activeTab === 'coach' && <CoachHub candidate={candidate} />}
               {activeTab === 'mock' && <MockHub candidate={candidate} />}
               {activeTab === 'radar' && <RadarHub candidate={candidate} />}
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ── AGENT 1: OPTIMIZER ─────────────────────────────────────

function OptimizerHub({ candidate }: { candidate: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    const res = await runProfileOptimizerAgent();
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const apply = async () => {
    if (!data) return;
    await updateCandidateProfileV2({ headline: data.suggested_headline });
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile Optimizer</h2>
          <p className="text-slate-500 font-medium">AI analysis to increase discoverability by high-intent recruiters.</p>
        </div>
        <button 
          onClick={run}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Run SEO Scan
        </button>
      </div>

      {!data ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6">
             <Zap className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">Ready to Boost Your Visibility?</h3>
           <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">The Profile Optimizer will analyze your headline, skills, and repos to suggest high-impact keywords.</p>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] text-blue-900 italic font-medium leading-relaxed">
             &ldquo;{data.reasoning}&rdquo;
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Headline</p>
                 <p className="font-bold text-slate-600">{candidate.headline || 'Not set'}</p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-indigo-200 shadow-xl shadow-indigo-100 space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-bl-2xl uppercase tracking-widest">Suggested</div>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Optimized</p>
                 <p className="font-black text-slate-900 leading-relaxed text-lg">{data.suggested_headline}</p>
              </div>
           </div>

           <button onClick={apply} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-slate-800 transition-colors">Apply Optimized Headline</button>
        </div>
      )}
    </div>
  );
}

// ── AGENT 2: COACH ─────────────────────────────────────────

function CoachHub({ candidate }: { candidate: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await runScoreCoachAgent();
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Score Coach</h2>
        <p className="text-slate-500 font-medium mt-2">Your personalized road-map to reaching the top 1% Pulse Score.</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 flex items-center justify-between shadow-sm">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Score Path</p>
            <div className="flex items-center gap-10">
               <div>
                 <p className="text-5xl font-black text-slate-900">{data?.current_score}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Current</p>
               </div>
               <div className="w-24 h-px bg-slate-100" />
               <div>
                  <p className="text-5xl font-black text-indigo-600">{data?.target_score}</p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Short-term Target</p>
               </div>
            </div>
         </div>
         <div className="text-center bg-indigo-50 px-8 py-6 rounded-[2rem] border border-indigo-100">
            <TrendingUp className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs font-black text-indigo-600">+{data?.target_score - data?.current_score} Potential</p>
         </div>
      </div>

      <div className="space-y-4">
         <h4 className="text-sm font-black text-slate-900 uppercase px-4">Priority Actions</h4>
         {data?.actions.map((act: any, i: number) => (
           <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-300 transition-all flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <Target className="w-6 h-6" />
                </div>
                <div>
                   <p className="font-black text-slate-900">{act.action}</p>
                   <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Impact: {act.impact}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${act.difficulty === 'high' ? 'text-rose-400' : 'text-amber-400'}`}>Difficulty: {act.difficulty}</span>
                   </div>
                </div>
              </div>
              <button className="px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-xs font-black hover:bg-slate-900 hover:text-white transition-all">Execute Action</button>
           </div>
         ))}
      </div>
    </div>
  );
}

// ── AGENT 3: MOCK ──────────────────────────────────────────

function MockHub({ candidate }: { candidate: any }) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const run = async () => {
    setLoading(true);
    const res = await runMockInterviewAgent({ difficulty, skills: candidate.skills });
    if (res.ok) {
      const d = await res.json();
      setQuestions(d.questions || []);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Neural Mock Drill</h2>
          <p className="text-slate-500 font-medium">Practice with AI-generated questions mapped to your project history.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-2xl">
           {['easy', 'medium', 'hard'].map(l => (
             <button 
              key={l}
              onClick={() => setDifficulty(l as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === l ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {l}
             </button>
           ))}
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="bg-slate-900 rounded-[3rem] p-16 text-center text-white relative overflow-hidden group">
           <Bot className="absolute -bottom-10 -left-10 w-48 h-48 text-indigo-500/10 group-hover:rotate-12 transition-transform duration-700" />
           <div className="relative z-10 max-w-sm mx-auto space-y-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <BrainCircuit className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Ready to verify your claims?</h3>
                <p className="text-slate-400 text-sm font-medium">I'll generate five targeted questions based on the repositories you've featured.</p>
              </div>
              <button 
                onClick={run}
                disabled={loading}
                className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                Generate Interview Drill
              </button>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
           {questions.map((q, i) => (
             <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 space-y-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{q.category}</span>
                   <ChevronDown className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-relaxed">{q.question}</p>
                <div className="pt-4 flex gap-4">
                  <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100">See Hint</button>
                  <button className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100">Ideal Answer</button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

// ── AGENT 4: RADAR ─────────────────────────────────────────

function RadarHub({ candidate }: { candidate: any }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getCandidateMatchesV2();
      if (res.ok) {
        const d = await res.json();
        setMatches(d.matches || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Opportunity Radar</h2>
        <p className="text-slate-500 font-medium mt-2">Deep insights into how you match against current market demand.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden col-span-1 md:col-span-2">
           <div className="flex items-center justify-between relative z-10">
              <div className="space-y-4">
                 <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Market Alignment</h4>
                 <h3 className="text-3xl font-black tracking-tight">You are in the Top 8% for <span className="text-emerald-400">Node.js</span> roles.</h3>
                 <p className="text-emerald-100/60 text-sm max-w-lg leading-relaxed">The radar shows high demand for architects with your specific Proof signals in Bengaluru and SF.</p>
              </div>
              <div className="w-32 h-32 bg-emerald-800 rounded-full flex items-center justify-center text-4xl font-black text-emerald-400 border-4 border-emerald-700 shadow-2xl">
                 A+
              </div>
           </div>
        </div>

        {matches.slice(0, 4).map(m => (
          <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.parsed_jds?.location || 'Remote'}</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{m.match_score}% Fit</span>
             </div>
             <h4 className="text-xl font-black text-slate-900 tracking-tight">{m.parsed_jds?.role_title || 'Software Engineer'}</h4>
             <div className="p-4 bg-slate-50 rounded-2xl italic text-xs text-slate-500 leading-relaxed border border-slate-100">
               &ldquo;{m.why_you?.slice(0, 100)}...&rdquo;
             </div>
             <Link href="/candidate/opportunities" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 group">
                View Full Analysis <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
