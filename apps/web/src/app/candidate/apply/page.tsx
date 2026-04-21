'use client';

import React, { useEffect, useState } from 'react';
import { CandidateNav } from '@/components/layout/CandidateNav';
import { AgentFeed } from '@/components/candidate/AgentFeed';
import { AgentControlPanel } from '@/components/candidate/AgentControlPanel';
import { JobsIntelligence } from '@/components/candidate/JobsIntelligence';
import { getAgentBriefing } from '@/lib/api';
import { Bot, Sparkles, TrendingUp, Zap, Loader2, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CandidateApplyHubPage() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAgentBriefing();
        const data = await res.json();
        setBriefing(data);
      } catch (err) {
        console.error('Failed to load agent briefing', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
           <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Calibrating Agent Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CandidateNav />

      <main className="mx-auto max-w-7xl w-full px-6 pt-32 pb-24">
        {/* Hub Header */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full ring-1 ring-primary/20">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    Agent Hub
                 </div>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">• Autonomous Matching Active</span>
              </div>
              <h1 className="text-6xl font-black text-foreground tracking-tight leading-none">
                Apply with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Intelligence.</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl font-medium text-lg leading-relaxed">
                {briefing?.summary || "Your agent has identified 3 high-fidelity matches where you have a 90%+ skill overlap. Autopilot is ready to draft your intros."}
              </p>
           </div>

           <div className="flex items-center gap-4">
              <div className="px-10 py-6 bg-secondary/50 backdrop-blur-md rounded-[32px] border border-white/5 shadow-2xl flex items-center gap-6 group hover:border-primary/20 transition-all">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 fill-current" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">Autopilot</p>
                    <p className="text-2xl font-black text-foreground mt-2">{briefing?.autopilot_status || 'Engaged'}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
          
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/80 rounded-2xl border border-white/10 flex items-center justify-center text-foreground shadow-xl">
                       <Bot className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-foreground tracking-tight">Agent Feed</h2>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time Decision Log</p>
                    </div>
                 </div>
                 <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:glow-text transition-all">Mark all read</button>
              </div>
              <AgentFeed />
            </section>
          </div>

          <aside className="space-y-10">
            <section className="bg-secondary/20 rounded-[40px] border border-white/5 p-8">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 bg-background rounded-xl border border-white/5 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-bold text-foreground tracking-tight uppercase tracking-wider">Intelligence</h2>
              </div>
              <JobsIntelligence />
            </section>

            <section>
              <AgentControlPanel />
            </section>

            {/* Hub Context Card */}
            <div className="p-10 bg-gradient-to-br from-primary/20 to-accent/10 rounded-[48px] border border-white/5 text-white space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-125 duration-700">
                  <Bot className="w-32 h-32" />
               </div>
               <div className="relative z-10">
                  <h4 className="text-xl font-black tracking-tight">Maximize Accuracy</h4>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed font-medium">
                    The Agent Hub uses your Profile metrics to compute matches. Ensure your Dashboard is updated with fresh signals.
                  </p>
                  <Link href="/candidate/dashboard" className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                     View Cockpit
                     <ArrowUpRight className="w-4 h-4" />
                  </Link>
               </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
