'use client';

import React, { useEffect, useState } from 'react';
import { CandidateNav } from '@/components/layout/CandidateNav';
import { 
  getCandidateDashboard, 
  recalculateCandidateScore, 
  completeChallengeV2 
} from '@/lib/api';
import { 
  TrendingUp, 
  Zap, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ShieldCheck,
  ChevronRight,
  Plus,
  Github,
  Trophy,
  History,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfileDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await getCandidateDashboard();
      if (!res.ok) throw new Error('Dashboard fetch failed');
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRecalculate = async () => {
    setRefreshing(true);
    try {
      await recalculateCandidateScore();
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const { candidate, streak, score, daily_challenge, proof_events_recent, proof_grid_12w } = data || {
      candidate: {},
      streak: { current_streak: 0, longest_streak: 0 },
      score: { current: 50, delta_7d: 0 },
      daily_challenge: null,
      proof_events_recent: [],
      proof_grid_12w: []
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CandidateNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-24">
        
        {/* Dashboard Header */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full ring-1 ring-primary/20">
                    <ShieldCheck className="w-3 h-3" />
                    Career Cockpit
                 </div>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">• {candidate?.full_name || 'Anonymous User'}</span>
              </div>
              <h1 className="text-6xl font-black text-foreground tracking-tight leading-none">
                Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Analysis.</span>
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-lg leading-relaxed">
                Your Pulse Score represents your verified market value. Continuous activity strengthens your agent's negotiation power.
              </p>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={handleRecalculate}
                disabled={refreshing}
                className="px-8 py-4 bg-secondary/50 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest text-foreground hover:bg-primary hover:text-primary-foreground border border-white/5 transition-all shadow-xl flex items-center gap-3"
              >
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                Sync Signals
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
           
           {/* Primary Metrics Zone */}
           <div className="space-y-12">
              
              {/* Score & Evolution Card */}
              <div className="bg-secondary/20 rounded-[48px] border border-white/5 p-10 relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-72 h-72 relative">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                          <circle 
                            cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="16" fill="transparent" 
                            strokeDasharray={753.6} 
                            strokeDashoffset={753.6 * (1 - (score.current / 100))} 
                            className="text-primary transition-all duration-1000 stroke-round" 
                            style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))' }}
                          />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Pulse Index</p>
                          <h2 className="text-8xl font-black text-foreground leading-none my-2 tracking-tighter">{score.current}</h2>
                          <div className={cn("px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-black", score.delta_7d >= 0 ? "bg-emerald-500/10 text-primary" : "bg-destructive/10 text-destructive")}>
                             {score.delta_7d >= 0 ? '+' : ''}{score.delta_7d} PTS
                             <TrendingUp className="w-3 h-3" />
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 space-y-8 text-center md:text-left">
                       <div>
                          <h3 className="text-3xl font-black text-foreground tracking-tight">Trust Calibration</h3>
                          <p className="text-muted-foreground font-medium mt-4 leading-relaxed text-lg">
                            Your profile is currently rated as <span className="text-primary font-black uppercase tracking-widest">{score.current > 75 ? 'Elite' : 'Verified'}</span> based on active GitHub signals.
                          </p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-background rounded-3xl border border-white/5">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Trust Signal</p>
                             <p className="text-2xl font-black text-primary mt-3 uppercase tracking-tighter">Strong</p>
                          </div>
                          <div className="p-6 bg-background rounded-3xl border border-white/5">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Rank</p>
                             <p className="text-2xl font-black text-foreground mt-3 tracking-tighter">Global Top 10%</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Decorative Glow */}
                 <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
              </div>

              {/* Activity Grid */}
              <section>
                 <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-secondary/50 rounded-xl border border-white/10 flex items-center justify-center text-primary">
                          <Calendar className="w-5 h-5" />
                       </div>
                       <h2 className="text-2xl font-black text-foreground tracking-tight">Signal Stream</h2>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">12 Week History</p>
                 </div>
                 <div className="bg-secondary/10 rounded-[40px] border border-white/5 p-10 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                       {(proof_grid_12w || []).map((day: any, i: number) => (
                         <div 
                           key={i} 
                           className={cn(
                             "w-4 h-4 rounded-sm transition-all hover:scale-150 cursor-help",
                             day.count === 0 ? "bg-white/5" : 
                             day.count === 1 ? "bg-primary/30" :
                             day.count === 2 ? "bg-primary/60" : "bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                           )}
                           title={`${day.count} events on ${day.day}`}
                         />
                       ))}
                    </div>
                 </div>
              </section>

              {/* Proof Events */}
              <section className="space-y-6">
                 <div className="flex items-center gap-4 mb-2 px-2">
                    <History className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Verification Log</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(proof_events_recent || []).slice(0, 4).map((ev: any) => (
                       <div key={ev.id} className="bg-secondary/20 rounded-3xl border border-white/5 p-6 flex items-center justify-between group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                {ev.event_type === 'github_commit' ? <Github className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{ev.event_type.replace('_', ' ')}</p>
                                <p className="text-sm font-bold text-foreground mt-2">{new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-primary">+{ev.score_impact}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>

           </div>

           {/* Sidebar: Streak & Challenge */}
           <aside className="space-y-12">
              
              {/* Streak Card */}
              <div className="bg-primary rounded-[48px] p-10 text-primary-foreground shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                       <Trophy className="w-12 h-12 text-primary-foreground/80" />
                       <div className="px-4 py-2 bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5">Record: {streak.longest_streak}D</div>
                    </div>
                    <div>
                       <h4 className="text-7xl font-black tracking-tighter leading-none">{streak.current_streak}</h4>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-70">Active Day Streak</p>
                    </div>
                    <p className="text-sm font-bold leading-relaxed opacity-90">
                       Keeping your streak above 7 days triggers the "Trusted" tier badge.
                    </p>
                 </div>
                 <div className="absolute top-0 right-0 p-12 text-black/5 transition-transform group-hover:scale-125 duration-700">
                    <Trophy className="w-64 h-64" />
                 </div>
              </div>

              {/* Daily Challenge Card */}
              <div className="bg-secondary/20 rounded-[48px] border border-white/5 p-10 space-y-8 shadow-sm group hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary animate-pulse">
                       <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-wider">Proof Goal</h2>
                 </div>

                 {daily_challenge ? (
                    <div className="space-y-8">
                       <div className="p-8 bg-background/50 rounded-3xl border border-white/5">
                          <p className="text-xl font-bold text-foreground leading-tight">{daily_challenge.challenge_data?.title}</p>
                          <p className="text-[10px] font-black text-primary mt-3 uppercase tracking-widest leading-none">Potential: +5 Score Index</p>
                       </div>
                       
                       {daily_challenge.completed_at ? (
                          <div className="w-full py-5 bg-primary/20 text-primary rounded-3xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest border border-primary/20">
                             <CheckCircle2 className="w-5 h-5" /> Goal Achieved
                          </div>
                       ) : (
                          <button 
                            onClick={async () => {
                               await completeChallengeV2(daily_challenge.id);
                               fetchDashboard();
                            }}
                            className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                          >
                             Verify Today's Work
                          </button>
                       )}
                    </div>
                 ) : (
                    <div className="text-center py-12">
                       <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                       <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Verified for today</p>
                    </div>
                 )}
              </div>

              {/* Action Cards */}
              <div className="space-y-4">
                 <Link href="/candidate/onboarding" className="block p-8 bg-secondary/30 border border-white/5 rounded-[40px] group hover:border-primary transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Signals</p>
                       <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground">Optimize Proof Onboarding</p>
                 </Link>
              </div>

           </aside>

        </div>
      </main>
    </div>
  );
}
