'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Flame,
  Target,
  Sparkles,
  Eye,
  Github,
  Code2,
  Video,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Plus,
  Compass,
  Zap,
  Mic,
  ClipboardCheck,
  FileText,
  GitBranch,
  Calendar,
  ArrowUpRight,
  Info,
  Loader2,
  Lock,
  Clock,
  Search,
  Briefcase
} from 'lucide-react';
import { Header } from '@pulse/ui';
import {
  getCandidateDashboard,
  completeChallenge
} from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Types ──────────────────────────────────────────────────

interface DashboardData {
  candidate: any;
  streak: { current_streak: number; longest_streak: number };
  score: {
    current: number;
    delta_7d: number;
    history_14d: { day: string; value: number }[];
  };
  daily_challenge: any;
  proof_events_recent: any[];
  proof_grid_12w: { day: string; count: number }[];
  top_matches: any[];
  recent_interests: any[];
}

// ── Components ─────────────────────────────────────────────

export default function CareerCockpit() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  const fetchDashboard = useCallback(async () => {
    const res = await getCandidateDashboard();
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Refetch on window focus
    const handleFocus = () => fetchDashboard();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboard]);

  if (loading) return <DashboardSkeleton />;

  const firstName = data?.candidate?.full_name?.split(' ')[0] || 'Candidate';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      <Header title="Career Cockpit" />

      {/* Top Strip */}
      <div className="h-20 bg-white border-b border-slate-200 sticky top-16 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-lg font-black text-slate-900 leading-tight">Good day, {firstName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{today}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pulse Score</p>
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-lg font-black text-slate-900">{data?.score.current}</span>
                   <span className={cn(
                     "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                     data?.score.delta_7d && data.score.delta_7d >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                   )}>
                     {data?.score.delta_7d && data.score.delta_7d >= 0 ? '+' : ''}{data?.score.delta_7d}
                   </span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500 fill-current" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Streak</p>
                <p className="text-sm font-black text-slate-900">{data?.streak.current_streak} Days</p>
             </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Row 1, Col 1: Pulse Score Card */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                
                {/* Score Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" className="fill-none stroke-slate-50" strokeWidth="16" />
                      <circle 
                        cx="96" cy="96" r="88" 
                        className="fill-none stroke-indigo-600 transition-all duration-1000 ease-out" 
                        strokeWidth="16" 
                        strokeLinecap="round" 
                        strokeDasharray={552.9} 
                        strokeDashoffset={552.9 - (552.9 * (data?.score.current || 0)) / 150} 
                      />
                   </svg>
                   <div className="text-center z-10">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{data?.score.current}</span>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">OF 150</span>
                   </div>
                </div>

                {/* Breakdown & Sparkline */}
                <div className="flex-1 space-y-8 w-full">
                   <div className="flex items-end justify-between">
                      <div className="space-y-1">
                         <h3 className="text-xl font-black text-slate-900">Score Breakdown</h3>
                         <p className="text-xs font-bold text-slate-400">Verified Professional Signals</p>
                      </div>
                      <div className="w-32 h-12">
                         <Sparkline data={data?.score.history_14d || []} color="#4F46E5" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ScoreComponent icon={<Github className="w-4 h-4" />} label="GitHub Sync" active={data?.candidate.github_verified} points={20} />
                      <ScoreComponent icon={<Code2 className="w-4 h-4" />} label="LeetCode" active={data?.candidate.leetcode_verified} points={20} />
                      <ScoreComponent icon={<Video className="w-4 h-4" />} label="Video Pitch" active={data?.candidate.has_video_pitch} points={15} />
                      <ScoreComponent icon={<Mic className="w-4 h-4" />} label="Mock Interviews" active={data?.proof_events_recent.some(e => e.event_type === 'mock_interview_completed')} points={15} />
                   </div>
                </div>
             </div>
          </div>

          {/* Row 1, Col 2: Daily Challenge */}
          <div className="col-span-12 lg:col-span-4 rounded-[40px] p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Target className="w-32 h-32 rotate-12" />
             </div>
             
             <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Today&apos;s Quest
                   </div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{data?.streak.current_streak}d Continuous</div>
                </div>

                <div className="flex-1 space-y-4">
                   <h3 className="text-2xl font-black leading-tight">{data?.daily_challenge?.challenge_data?.title || 'No challenge active'}</h3>
                   <p className="text-sm text-slate-400 font-medium">Complete this to boost your Pulse Score and maintain your ranking.</p>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                   {data?.daily_challenge?.completed_at ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                         <CheckCircle2 className="w-5 h-5" /> Quest Complete
                      </div>
                   ) : (
                      <button 
                         onClick={async () => {
                            if (!data?.daily_challenge) return;
                            setCelebrating(true);
                            await completeChallenge(data.daily_challenge.id);
                            fetchDashboard();
                            setTimeout(() => setCelebrating(false), 3000);
                         }}
                         className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                      >
                         Mark Complete
                      </button>
                   )}
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/50">{i}</div>)}
                   </div>
                </div>
             </div>
          </div>

          {/* Row 2: Proof of Work Feed */}
          <div className="col-span-12 space-y-6">
             <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900">Proof of Work</h2>
                   <p className="text-sm font-bold text-slate-400">Your verified technical legacy</p>
                </div>
                <Link href="/candidate/proof" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 group">
                   View all proof <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
             </div>

             <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm space-y-10">
                {/* Heatmap Grid */}
                <div className="flex flex-col space-y-4 overflow-x-auto pb-4 scrollbar-hide">
                   <div className="flex gap-1.5 h-32 items-end">
                      {Array.from({ length: 84 }).map((_, i) => {
                         const date = new Date();
                         date.setDate(date.getDate() - (83 - i));
                         const dateStr = date.toISOString().slice(0, 10);
                         const dayData = data?.proof_grid_12w.find(d => d.day === dateStr);
                         const count = dayData?.count || 0;
                         
                         return (
                            <div 
                               key={i} 
                               title={`${count} events on ${dateStr}`}
                               className={cn(
                                  "w-3.5 rounded-sm transition-all flex-shrink-0 group relative",
                                  count === 0 ? "bg-slate-50 h-[8%]" : 
                                  count === 1 ? "bg-indigo-100 h-[30%]" :
                                  count === 2 ? "bg-indigo-300 h-[60%]" :
                                  "bg-indigo-600 h-full"
                               )}
                            >
                               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                  {count} events • {dateStr}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                   <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <span>12 Weeks Ago</span>
                      <span>Target: High Consistency</span>
                      <span>Today</span>
                   </div>
                </div>

                {/* Chrono Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                   {data?.proof_events_recent.map(event => (
                      <div key={event.id} className="flex items-center justify-between py-3 border-b border-slate-50 group transition-all hover:pl-2">
                         <div className="flex items-center gap-4">
                            <EventIcon type={event.event_type} />
                            <div className="space-y-0.5 max-w-[280px]">
                               <p className="text-[13px] font-bold text-slate-900 truncate">{formatEventTitle(event)}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.created_at).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">
                            +{event.score_impact}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Row 3, Col 1: Top Opportunities */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
             <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900">Top Opportunities</h2>
                   <p className="text-sm font-bold text-slate-400">Agent-ranked for your current stack</p>
                </div>
                <Link href="/candidate/opportunities" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 group">
                   View radar <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {data?.top_matches.map(m => (
                   <div key={m.id} className="bg-white p-6 rounded-[32px] border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <BriefcaseIcon />
                         </div>
                         <div className="space-y-1">
                            <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{m.parsed_jds.role_title}</h4>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                               <span>{m.parsed_jds.location}</span>
                               <span className="w-1 h-1 bg-slate-200 rounded-full" />
                               <span>{m.match_score}% High Relevance</span>
                            </div>
                         </div>
                      </div>
                      <Link href={`/candidate/opportunities?id=${m.id}`} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                         <ArrowUpRight className="w-5 h-5" />
                      </Link>
                   </div>
                ))}
                {data?.top_matches.length === 0 && (
                   <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                      <p className="text-sm font-bold text-slate-400">No matches found. Improve your score to trigger radar items.</p>
                   </div>
                )}
             </div>
          </div>

          {/* Row 3, Col 2: Recruiter Interest */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-slate-900">Inbox</h2>
                   <p className="text-sm font-bold text-slate-400">Live Hiring Signals</p>
                </div>
                <Link href="/candidate/inbox" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 group">
                   Manage Inbox <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
             </div>

             <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm min-h-[300px] flex flex-col justify-between">
                {data?.recent_interests.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                         <Search className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px]">
                        No recruiter interest yet. Keep your Pulse Score climbing.
                      </p>
                   </div>
                ) : (
                   <div className="space-y-6">
                      {data?.recent_interests.map((interest, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5" />
                            <div className="space-y-1">
                               <p className="text-sm font-black text-slate-900 leading-tight">Senior TA at a High-Growth Startup</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase tracking-widest">
                                     {interest.interest_type.replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">{new Date(interest.created_at).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}

                <Link href="/candidate/inbox" className="mt-8 w-full py-4 border-2 border-slate-50 rounded-2xl text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-100 hover:text-slate-900 transition-all">
                   Full Inbox History
                </Link>
             </div>
          </div>

          {/* Row 4: Copilot Quick Actions */}
          <div className="col-span-12 space-y-6 pt-4">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction icon={<Compass className="w-5 h-5 text-indigo-600" />} label="Profile Optimizer" href="/candidate/copilot?agent=optimizer" />
                <QuickAction icon={<Mic className="w-5 h-5 text-rose-500" />} label="Mock Interview" href="/candidate/copilot?agent=interviewer" />
                <QuickAction icon={<Target className="w-5 h-5 text-blue-500" />} label="Opportunities" href="/candidate/opportunities" />
                <QuickAction icon={<Sparkles className="w-5 h-5 text-amber-500" />} label="Score Coach" href="/candidate/copilot?agent=score-coach" />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ── Shared Subcomponents ───────────────────────────────────

function ScoreComponent({ icon, label, active, points }: { icon: React.ReactNode, label: string, active?: boolean, points: number }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all flex items-center justify-between group",
      active ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          active ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-500"
        )}>
          {icon}
        </div>
        <span className="text-xs font-black text-slate-900">{label}</span>
      </div>
      {active ? (
        <span className="text-[10px] font-black text-emerald-600">+{points}</span>
      ) : (
        <Link href={`/candidate/proof?verify=${label.toLowerCase().replace(' ', '-')}`} className="text-[10px] font-black text-indigo-600 underline group-hover:text-indigo-700 transition-colors uppercase tracking-widest">
           Verify
        </Link>
      )}
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    'github_commit': <GitBranch className="w-4 h-4 text-slate-400" />,
    'leetcode_solved': <Code2 className="w-4 h-4 text-amber-500" />,
    'mock_interview_completed': <Mic className="w-4 h-4 text-rose-500" />,
    'skill_assessment_passed': <ClipboardCheck className="w-4 h-4 text-emerald-500" />,
    'case_study_added': <FileText className="w-4 h-4 text-blue-500" />,
    'video_pitch_added': <Video className="w-4 h-4 text-indigo-500" />
  };
  return (
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
      {icons[type] || <Plus className="w-4 h-4 text-slate-400" />}
    </div>
  );
}

function BriefcaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-4 p-8 bg-white border border-slate-100 rounded-[32px] hover:border-indigo-200 hover:shadow-lg transition-all text-center">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function formatEventTitle(event: any) {
  switch (event.event_type) {
    case 'github_commit': return 'Pushed commit to main';
    case 'leetcode_solved': return 'Solved daily algorithm';
    case 'mock_interview_completed': return 'Interview: Advanced Node.js';
    case 'skill_assessment_passed': return 'Verified Skill: React';
    case 'case_study_added': return 'Case Study: Real-time Analytics';
    case 'video_pitch_added': return 'Updated Intro Pitch';
    case 'score_increased': return 'Pulse Score Achievement';
    default: return 'Significant Milestone';
  }
}

function Sparkline({ data, color }: { data: { day: string; value: number }[], color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       {/* Glow Effect */}
       <path 
        d={`M ${points}`} 
        fill="none" 
        stroke={color} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(79, 70, 229, 0.2))' }}
      />
    </svg>
  );
}

// ── Skeletons ──────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <Header title="Career Cockpit" />
       <div className="h-20 bg-white border-b border-slate-200" />
       <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 animate-pulse">
          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-8 h-64 bg-slate-200 rounded-[40px]" />
             <div className="col-span-4 h-64 bg-slate-200 rounded-[40px]" />
             <div className="col-span-12 h-80 bg-slate-200 rounded-[40px]" />
             <div className="col-span-8 h-96 bg-slate-200 rounded-[40px]" />
             <div className="col-span-4 h-96 bg-slate-200 rounded-[40px]" />
          </div>
       </main>
    </div>
  );
}
