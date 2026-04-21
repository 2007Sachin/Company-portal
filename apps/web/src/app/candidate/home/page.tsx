'use client';

import React, { useEffect, useState } from 'react';
import { CandidateNav } from '@/components/layout/CandidateNav';
import { getAllJobs } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  Sparkles,
  Loader2,
  TrendingUp,
  Filter,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CandidateHomePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getAllJobs(1, 40, search);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <CandidateNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-24">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-12">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full ring-1 ring-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Layers className="w-3.5 h-3.5" />
                    Global Marketplace
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Activity className="w-3 h-3 text-primary" />
                    14 New Signals
                 </div>
              </div>
              <h1 className="text-7xl font-black text-foreground tracking-tighter leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-accent">Job Wall.</span>
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-xl leading-relaxed">
                Autonomous discovery of premium verified roles. Your <Link href="/candidate/apply" className="text-primary hover:glow-text transition-all font-bold">Agent Hub</Link> is currently calibrating matches across 40+ engineering nodes.
              </p>
           </div>

           {/* Search Bar - Cyber Style */}
           <div className="relative w-full max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[32px] blur-lg opacity-0 group-focus-within:opacity-100 transition-all" />
              <div className="relative flex items-center bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden group-focus-within:border-primary/40 transition-all">
                 <div className="pl-6 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Search by role or company..."
                   className="w-full pl-4 pr-6 py-5 bg-transparent border-none focus:ring-0 text-foreground font-bold placeholder:text-muted-foreground/50 transition-all"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="h-80 bg-secondary/20 rounded-[48px] border border-white/5 animate-pulse" />
             ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-40 text-center bg-secondary/10 rounded-[64px] border border-dashed border-white/5">
             <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-8 text-muted-foreground/20 shadow-2xl">
                <Search className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black text-foreground tracking-tight">No Matches Found</h3>
             <p className="text-muted-foreground font-medium mt-3 text-lg">Adjust your filters or sync more signals in your Profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  return (
    <div className="group relative bg-secondary/20 backdrop-blur-xl rounded-[48px] border border-white/5 p-10 hover:bg-secondary/40 hover:border-primary/30 transition-all flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.2)]">
      <div className="relative z-10 space-y-8">
        
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="w-16 h-16 bg-background/80 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all shadow-inner">
            <span className="text-2xl font-black text-muted-foreground group-hover:text-primary transition-colors">
              {job.role_title?.[0] || 'J'}
            </span>
          </div>
          <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full ring-1 ring-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            Verified Signal
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-foreground tracking-tight leading-[1.1] group-hover:glow-text-sm transition-all line-clamp-2">{job.role_title}</h3>
          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
             <MapPin className="w-3.5 h-3.5 text-primary" />
             {job.location}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {(job.skills || []).slice(0, 3).map((skill: string) => (
            <span key={skill} className="px-4 py-2 bg-background/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 group-hover:border-primary/10 transition-all">
              {skill}
            </span>
          ))}
        </div>

        {/* Card Footer */}
        <div className="pt-10 border-t border-white/5 flex items-center justify-between">
           <div className="flex flex-col">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Calibration</p>
              <div className="flex items-center gap-2 mt-2">
                 <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 </div>
                 <p className="text-[10px] font-black text-primary uppercase">85%</p>
              </div>
           </div>
           
           <Link href="/candidate/apply" className="h-12 px-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 group">
              Examine
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>
      
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
