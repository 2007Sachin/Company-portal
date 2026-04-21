'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Sparkles, Zap, Bot, ShieldCheck, ArrowRight, Github, Trophy, Activity } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30 selection:text-primary">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group cursor-pointer hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase tracking-widest leading-none">Pulse</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" prefetch>
              <button className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                Login
              </button>
            </Link>
            <Link href="/auth/login" prefetch>
              <button className="h-11 px-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-lg shadow-primary/10">
                Join Network
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Animated Background Highlights */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[150px]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Next-Gen Agentic Sourcing
             </div>
             
             <h1 className="text-7xl md:text-9xl font-black text-foreground tracking-tighter leading-[0.9] mb-12">
               Code is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-accent">Pedigree.</span>
             </h1>
             
             <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium mb-16">
               Stop competing with static resumes. Pulse recalibrates your technical value using live verification signals from GitHub, LeetCode, and Open Source activity.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/auth/login" prefetch>
                   <button className="h-16 px-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 group">
                      Establish Profile
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                </Link>
                <button className="h-16 px-10 bg-secondary/50 backdrop-blur-md border border-white/5 text-foreground text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-secondary transition-all">
                   Network Stats
                </button>
             </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="pb-40 px-6">
           <div className="max-w-6xl mx-auto">
              <div className="bg-secondary/30 backdrop-blur-xl rounded-[64px] border border-white/5 p-1 px-1 shadow-[0_0_100px_rgba(16,185,129,0.05)] relative group overflow-hidden">
                 <div className="bg-background/80 rounded-[63px] p-12 md:p-20 relative z-10 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                       <div className="space-y-10">
                          <div className="flex items-center gap-6">
                             <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-5xl font-black text-primary-foreground shadow-2xl shadow-primary/30">84</div>
                             <div>
                                <h3 className="text-4xl font-black text-foreground tracking-tight">Sachin S.</h3>
                                <div className="flex items-center gap-2 mt-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                   <ShieldCheck className="w-4 h-4" />
                                   Elite Verified Tier
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Pulse Consistency Index</span>
                                <span className="text-primary">+12% vs week</span>
                             </div>
                             <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[84%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 bg-secondary/20 rounded-3xl border border-white/5">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Authored</p>
                                <p className="text-2xl font-bold text-foreground">1.2k+ Commits</p>
                             </div>
                             <div className="p-6 bg-secondary/20 rounded-3xl border border-white/5">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">LeetCode</p>
                                <p className="text-2xl font-bold text-foreground">Top 1% Worldwide</p>
                             </div>
                          </div>
                       </div>

                       <div className="relative">
                          <div className="absolute -inset-10 bg-primary/10 blur-[80px] rounded-full" />
                          <div className="relative bg-background/50 rounded-3xl border border-white/10 p-8 space-y-6 backdrop-blur-md">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                   <Zap className="w-5 h-5 fill-current" />
                                </div>
                                <h4 className="font-black text-xs uppercase tracking-widest">Agent Activity</h4>
                             </div>
                             <p className="text-sm text-muted-foreground leading-relaxed">
                                Agent has identified 3 matches with 92% skill fidelity. Drafting intros for Stripe and Vercel...
                             </p>
                             <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                   <span>Active Negotiation</span>
                                   <ArrowRight className="w-3 h-3" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Border Glow Effect */}
                 <div className="absolute inset-0 border-[2px] border-primary/20 rounded-[64px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
           </div>
        </section>

        {/* Value Prop 1 */}
        <section className="py-40 bg-secondary/5">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-center gap-24">
                 <div className="flex-1 space-y-10">
                    <div className="inline-block px-4 py-1.5 bg-background border border-white/5 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                       Candidate Engine
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
                      Stop Claiming. <br />
                      <span className="text-primary italic">Start Proving.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                      In the age of LLMs, anyone can write a resume. Pulse ensures your technical depth is non-fungible through automated signal verification.
                    </p>
                    <div className="space-y-6 pt-4">
                       {[
                         { icon: <Github className="w-5 h-5" />, title: "Open Source Proof", desc: "Live-sync your codebase activity into a verifiable trust-score." },
                         { icon: <Trophy className="w-5 h-5" />, title: "Market Competitive Index", desc: "Know exactly where you rank among your global engineering peers." }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                               {item.icon}
                            </div>
                            <div>
                               <p className="text-lg font-bold text-foreground">{item.title}</p>
                               <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="w-full lg:w-[500px] h-[600px] bg-secondary/20 rounded-[48px] border border-white/5 flex items-center justify-center relative group overflow-hidden">
                    <Bot className="w-48 h-48 text-primary shadow-[0_0_50px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                 </div>
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="py-40">
           <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
              <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
                 The Network is <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Calling.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                 Join 5,000+ elite engineers using autonomous agents to manage their career visibility.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                 <Link href="/auth/login" prefetch>
                    <button className="h-16 px-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.25em] rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2x shadow-primary/20">
                       Deploy Profile
                       <ArrowRight className="w-4 h-4" />
                    </button>
                 </Link>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-black uppercase tracking-tight text-foreground">Pulse</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering developers with activity-as-pedigree. Built for the meritocratic future of hiring.
              </p>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-8">Ecosystem</p>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                 <li><Link href="/" className="hover:text-primary transition-colors">Pulse Index</Link></li>
                 <li><Link href="/" className="hover:text-primary transition-colors">Verification APIs</Link></li>
                 <li><Link href="/" className="hover:text-primary transition-colors">Public Node</Link></li>
              </ul>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-8">Architecture</p>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                 <li><Link href="/terms" className="hover:text-primary transition-colors">Service Terms</Link></li>
                 <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Node</Link></li>
              </ul>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-8">Node Registry</p>
              <div className="flex gap-4">
                 {['twitter', 'github', 'linkedin'].map(social => (
                    <div key={social} className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-primary group transition-all cursor-pointer">
                       <span className="sr-only">{social}</span>
                       <div className="w-5 h-5 bg-muted-foreground group-hover:bg-primary-foreground opacity-50 group-hover:opacity-100 transition-all" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
           &copy; {new Date().getFullYear()} Pulse Network. All Signals Running.
        </div>
      </footer>
    </div>
  );
}
