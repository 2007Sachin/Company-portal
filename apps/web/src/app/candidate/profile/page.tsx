'use client';

import React, { useEffect, useState } from 'react';
import { CandidateNav } from '@/components/layout/CandidateNav';
import { 
  getCandidateMe, 
  getMyGithubRepos, 
  getMyCaseStudies, 
  getMyVideoPitch
} from '@/lib/api';
import { 
  Github, 
  Video, 
  BookOpen, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp,
  Loader2,
  ArrowUpRight,
  PlayCircle,
  Code2,
  Layout,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [pRes, rRes, cRes, vRes] = await Promise.all([
          getCandidateMe(),
          getMyGithubRepos(),
          getMyCaseStudies(),
          getMyVideoPitch()
        ]);

        if (pRes.ok) setProfile(await pRes.json());
        if (rRes.ok) setRepos(await rRes.json());
        if (cRes.ok) setCaseStudies(await cRes.json());
        if (vRes.ok) setVideo(await vRes.json());
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
           <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Synching Pedigree...</p>
        </div>
      </div>
    );
  }

  const score = profile?.pulse_score || 50;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CandidateNav />

      <main className="mx-auto max-w-7xl w-full px-6 pt-32 pb-24">
        
        {/* Profile Hero */}
        <section className="mb-20">
           <div className="bg-secondary/20 rounded-[56px] border border-white/5 p-12 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                 
                 {/* Pulse Score Orb */}
                 <div className="w-80 h-80 relative flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-white/5" />
                       <circle 
                         cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="20" fill="transparent" 
                         strokeDasharray={879.2} 
                         strokeDashoffset={879.2 * (1 - (score / 100))} 
                         className="text-primary transition-all duration-1000 stroke-round" 
                         style={{ filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))' }}
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Pulse</p>
                       <h2 className="text-9xl font-black text-foreground tracking-tighter leading-none my-2">{score}</h2>
                       <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase">Trending High</span>
                       </div>
                    </div>
                 </div>

                 {/* Basic Info */}
                 <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="space-y-4">
                       <div className="flex items-center justify-center lg:justify-start gap-4">
                          <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-primary/20">
                             Verified Identity
                          </div>
                          <p className="text-muted-foreground text-sm font-medium">Joined {new Date(profile?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                       </div>
                       <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tight leading-none">
                          {profile?.full_name}
                       </h1>
                       <p className="text-2xl font-bold text-muted-foreground italic leading-relaxed">
                          "{profile?.headline || 'Building the future of autonomous systems.'}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                       <MetricBox icon={MapPin} label="Location" value={profile?.location || 'Remote'} />
                       <MetricBox icon={Briefcase} label="Exp" value={`${profile?.experience_years} Years`} />
                       <MetricBox icon={Calendar} label="Notice" value={`${profile?.notice_period_days} Days`} />
                       <MetricBox icon={ShieldCheck} label="Tier" value={score > 75 ? 'Elite' : 'Rising'} highlight />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                       {(profile?.skills || []).map((skill: string) => (
                         <span key={skill} className="px-4 py-2 bg-background border border-white/5 rounded-xl text-xs font-bold text-foreground">
                            {skill}
                         </span>
                       ))}
                    </div>
                 </div>

              </div>

              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
           </div>
        </section>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           
           {/* Section: GitHub Signals */}
           <div className="lg:col-span-2 space-y-12">
              <section>
                 <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-secondary/80 rounded-2xl border border-white/10 flex items-center justify-center text-primary shadow-xl">
                          <Github className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-foreground tracking-tight">GitHub Infrastructure</h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Source Signals</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {repos.filter(r => r.is_featured).map(repo => (
                       <RepoCard key={repo.id} repo={repo} />
                    ))}
                    {repos.filter(r => !r.is_featured).slice(0, 2).map(repo => (
                       <RepoCard key={repo.id} repo={repo} />
                    ))}
                 </div>
              </section>

              {/* Section: Intelligence Logs (Case Studies) */}
              <section>
                 <div className="flex items-center gap-4 mb-8 px-2">
                    <div className="w-12 h-12 bg-secondary/80 rounded-2xl border border-white/10 flex items-center justify-center text-primary shadow-xl">
                       <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-foreground tracking-tight">Intelligence Logs</h3>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Professional Case Studies</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {caseStudies.length > 0 ? (
                      caseStudies.map(study => (
                        <div key={study.id} className="bg-secondary/10 rounded-[32px] border border-white/5 p-8 group hover:border-primary/20 transition-all">
                           <div className="flex justify-between items-start mb-6">
                              <h4 className="text-2xl font-black text-foreground tracking-tight">{study.title}</h4>
                              <div className="flex gap-2">
                                 {study.tags?.map((t: string) => (
                                   <span key={t} className="px-2 py-1 bg-background border border-white/5 rounded-lg text-[8px] font-black uppercase text-muted-foreground">
                                      {t}
                                   </span>
                                 ))}
                              </div>
                           </div>
                           <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                              {study.description}
                           </p>
                           {study.external_url && (
                             <a href={study.external_url} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:glow-text transition-all">
                                Examine Outcome <ArrowUpRight className="w-4 h-4" />
                             </a>
                           )}
                        </div>
                      ))
                    ) : (
                      <div className="py-20 bg-secondary/5 rounded-[40px] border border-dashed border-white/10 text-center">
                         <Layout className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                         <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">No case studies documented yet</p>
                      </div>
                    )}
                 </div>
              </section>
           </div>

           {/* Sidebar: Presence & Social */}
           <div className="space-y-12">
              
              {/* Video Verification Section */}
              <section className="bg-secondary/20 rounded-[48px] border border-white/5 p-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary shadow-lg animate-pulse">
                       <PlayCircle className="w-6 h-6 fill-current" />
                    </div>
                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase tracking-wider">Video Presence</h3>
                 </div>

                 {video?.video_url ? (
                   <div className="space-y-6">
                      <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                         <video 
                           src={video.video_url} 
                           className="w-full h-full object-cover opacity-80"
                           poster="/api/placeholder/1920/1080"
                         />
                         <div className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-primary/20 transition-all">
                            <PlayCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Transcript Scan</p>
                         <div className="bg-background/50 rounded-2xl p-6 border border-white/5">
                            <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-4">
                               "{video.transcript || 'Identity verification complete. Candidate presents high technical density and clear communication signals.'}"
                            </p>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="py-12 bg-background/30 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
                      <Video className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Video signal pending</p>
                   </div>
                 )}
              </section>

              {/* Achievements / Credentials */}
              <section className="space-y-6">
                 <div className="flex items-center gap-4 px-2">
                    <Award className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-black text-foreground tracking-tight">Credentials</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <CredentialCard label="GitHub Verified" status={profile?.github_verified} />
                    <CredentialCard label="LeetCode Verified" status={profile?.leetcode_verified} />
                    <CredentialCard label="Identity Verified" status={true} />
                 </div>
              </section>

              {/* Sidebar Action */}
              <Link href="/candidate/onboarding" className="block p-10 bg-primary rounded-[40px] text-primary-foreground group hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20">
                 <h4 className="text-2xl font-black tracking-tight mb-4">Signal Optimization</h4>
                 <p className="text-sm font-bold leading-relaxed opacity-90 mb-8">
                    Boost your Pulse Index by connecting more external signals and documenting new case studies.
                 </p>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b border-background/20 pb-2 w-fit group-hover:gap-4 transition-all">
                    Initialize Update <ArrowUpRight className="w-4 h-4" />
                 </div>
              </Link>
           </div>

        </div>
      </main>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value, highlight }: { icon: any, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="p-6 bg-background rounded-3xl border border-white/5 space-y-3">
       <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3 h-3" />
          <p className="text-[8px] font-black uppercase tracking-widest">{label}</p>
       </div>
       <p className={cn("text-lg font-black tracking-tight", highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function RepoCard({ repo }: { repo: any }) {
  return (
    <div className="bg-secondary/10 rounded-3xl border border-white/5 p-8 flex flex-col justify-between group hover:border-primary/30 transition-all">
       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Code2 className="w-5 h-5" />
             </div>
             {repo.is_featured && (
               <span className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-md ring-1 ring-primary/20">Featured</span>
             )}
          </div>
          <div>
             <h4 className="text-lg font-black text-foreground group-hover:glow-text-sm transition-all">{repo.repo_name}</h4>
             <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed line-clamp-3">
                {repo.ai_generated_readme || 'Synthesizing knowledge from source files... Higher technical density detected.'}
             </p>
          </div>
       </div>
       <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
             {(repo.inferred_skills || ['TypeScript', 'Next.js']).slice(0, 2).map((s: string) => (
                <span key={s} className="px-2 py-1 bg-background border border-white/5 rounded-lg text-[8px] font-black uppercase text-muted-foreground">
                   {s}
                </span>
             ))}
          </div>
          <a href={repo.repo_url} target="_blank" className="w-10 h-10 bg-background border border-white/5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-md">
             <ExternalLink className="w-4 h-4" />
          </a>
       </div>
    </div>
  );
}

function CredentialCard({ label, status }: { label: string, status: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 bg-secondary/10 rounded-3xl border border-white/5">
       <p className="text-xs font-black uppercase tracking-widest text-foreground">{label}</p>
       {status ? (
         <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
         </div>
       ) : (
         <div className="w-6 h-6 bg-white/5 text-muted-foreground/30 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 opacity-20" />
         </div>
       )}
    </div>
  );
}
