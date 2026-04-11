'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Search, 
  ChevronDown,
  X,
  List,
  LayoutGrid,
  User,
  Heart,
  Plus,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  LogOut
} from 'lucide-react';

const mockCandidates = [
  {
    id: 1,
    name: "Candidate #1042",
    headline: "Full Stack Developer",
    location: "Bangalore",
    pulseScore: 785,
    noticePeriod: "15 Days",
    experience: "4 Yrs",
    skills: ["React", "TypeScript", "Node.js"],
    about: "Experienced full-stack developer with a strong background in scalable web applications. Contributed to several major open-source UI libraries. Top 5% on LeetCode.",
    lastActive: "2 hrs ago",
    badges: [
      { text: "Immediate Joiner", color: "emerald", icon: "dot" },
      { text: "Top 5% in React", color: "purple", icon: "fire" },
      { text: "GitHub Verified", color: "slate", icon: "shield" }
    ]
  },
  {
    id: 2,
    name: "Candidate #2819",
    headline: "Senior UI Engineer",
    location: "Remote (India)",
    pulseScore: 742,
    noticePeriod: "30 Days",
    experience: "6 Yrs",
    skills: ["React", "Next.js", "Tailwind CSS"],
    about: "Former FAANG engineer specializing in complex frontend architectures and micro-frontends. Passionate about web performance and accessibility.",
    lastActive: "1 day ago",
    badges: [
      { text: "30 Days Notice", color: "amber", icon: "alert" },
      { text: "Ex-FAANG", color: "blue", icon: "zap" },
      { text: "Fully Verified", color: "slate", icon: "shield" }
    ]
  },
  {
    id: 3,
    name: "Candidate #0921",
    headline: "Frontend Architect",
    location: "Pune",
    pulseScore: 728,
    noticePeriod: "Immediate",
    experience: "8 Yrs",
    skills: ["React", "System Design", "GraphQL"],
    about: "Strategic technical leader with a track record of rebuilding legacy SPA into modern Next.js applications serving millions of DAU.",
    lastActive: "5 mins ago",
    badges: [
      { text: "Immediate", color: "emerald", icon: "dot" },
      { text: "GitHub Verified", color: "slate", icon: "shield" },
      { text: "LeetCode Verified", color: "slate", icon: "shield" }
    ]
  }
];

export default function TalentDiscoveryPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [addedToPipeline, setAddedToPipeline] = useState<number[]>([]);

  const handleAddToPipeline = (id: number) => {
    if (!addedToPipeline.includes(id)) {
      setAddedToPipeline([...addedToPipeline, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-6 border-r border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Pulse.</span>
          </div>
          <Link 
            href="/recruiter/search" 
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/recruiter/dashboard" 
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-xl"
          >
            Go to Pipeline <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-4 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              R
            </div>
            <Link href="/auth/login" className="text-slate-400 hover:text-red-500 transition-colors" title="Log out">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout: 2 Columns */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-8 flex gap-8">
        
        {/* Section 1: The Left Sidebar (Filters) */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-[90px]">
            {/* Active Context Banner */}
            <div className="bg-indigo-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mb-0.5">Matching for</p>
                <p className="text-sm font-semibold text-slate-900">Senior Frontend Developer</p>
              </div>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors">
                Edit
              </button>
            </div>

            <div className="p-5 space-y-7">
              {/* Pulse Score */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">Minimum Pulse Score</label>
                  <span className="text-sm font-bold text-indigo-600">700+</span>
                </div>
                {/* Mock Range Slider */}
                <div className="relative w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="absolute top-0 left-[30%] right-0 h-full bg-indigo-500 rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[30%] w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-sm cursor-grab"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>0</span>
                  <span>1000</span>
                </div>
              </div>

              <div className="h-px bg-slate-100 -mx-5"></div>

              {/* Notice Period */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  Notice Period
                </label>
                <div className="space-y-2.5">
                  {['Immediate', '15 Days', '30 Days', '60+ Days'].map((period, i) => (
                    <label key={period} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" defaultChecked={i === 0 || i === 1} className="peer sr-only" />
                        <div className="w-4.5 h-4.5 border border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors group-hover:border-indigo-400"></div>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{period}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100 -mx-5"></div>

              {/* Experience */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Experience (Years)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="number" defaultValue="3" min="0" className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Min</span>
                  </div>
                  <div className="relative flex-1">
                    <input type="number" defaultValue="6" min="0" className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Max</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Section 2 & 3: The Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <span className="font-bold">{mockCandidates.length}</span> candidates found
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm transition-colors">
                  <option>Highest Pulse Score</option>
                  <option>Recently Active</option>
                  <option>Experience: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button className="p-1.5 bg-slate-100 text-slate-800 rounded-lg shadow-sm transition-colors">
                  <List className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Candidate List */}
          <div className="space-y-4">
            
            {mockCandidates.map((candidate) => {
              const isAdded = addedToPipeline.includes(candidate.id);
              
              return (
                <div key={candidate.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Left Area: Avatar & Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between sm:justify-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                          </div>
                          <p className="text-sm text-slate-500 font-medium">{candidate.headline} | {candidate.location}</p>
                        </div>
                      </div>

                      {/* Readiness Badges */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {candidate.badges.map((badge, index) => {
                          let badgeClasses = '';
                          let iconElement = null;

                          if (badge.color === 'emerald') {
                            badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          } else if (badge.color === 'purple') {
                            badgeClasses = 'bg-purple-50 text-purple-700 border-purple-100';
                          } else if (badge.color === 'slate') {
                            badgeClasses = 'bg-slate-50 text-slate-600 border-slate-200';
                          } else if (badge.color === 'amber') {
                            badgeClasses = 'bg-amber-50 text-amber-700 border-amber-100';
                          } else if (badge.color === 'blue') {
                            badgeClasses = 'bg-blue-50 text-blue-700 border-blue-100';
                          }

                          if (badge.icon === 'dot') iconElement = <div className={`w-1.5 h-1.5 rounded-full bg-${badge.color}-500`}></div>;
                          if (badge.icon === 'fire') iconElement = <span className="text-xs">🔥</span>;
                          if (badge.icon === 'shield') iconElement = <Shield className="w-3 h-3 text-slate-400" />;
                          if (badge.icon === 'alert') iconElement = <AlertCircle className="w-3 h-3" />;
                          if (badge.icon === 'zap') iconElement = <Zap className={`w-3 h-3 text-${badge.color}-500`} />;

                          return (
                            <span key={index} className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-semibold tracking-wide ${badgeClasses}`}>
                              {iconElement} {badge.text}
                            </span>
                          );
                        })}
                      </div>

                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                           <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-xs font-medium">
                              {skill}
                           </span>
                        ))}
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-4 text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>Experience: {candidate.experience}</span>
                        <span className="text-slate-300">•</span>
                        <span>Notice: {candidate.noticePeriod}</span>
                        <span className="text-slate-300">•</span>
                        <span>Active: {candidate.lastActive}</span>
                      </div>
                    </div>

                    {/* Right Area: Score & Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                      <div className="text-left sm:text-right w-full">
                        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Pulse Score</p>
                        <p className="text-3xl font-black text-indigo-600 tracking-tight">{candidate.pulseScore}</p>                     
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all shadow-sm group/btn flex-shrink-0">
                            <Heart className="w-4 h-4 group-hover/btn:fill-current" />
                          </button>
                          <button 
                            onClick={() => handleAddToPipeline(candidate.id)}
                            disabled={isAdded}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 flex-shrink-0 min-w-[150px]
                              ${isAdded 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-90 cursor-default' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/30'
                              }`}
                          >
                            {isAdded ? (
                              <><Check className="w-4 h-4" /> Added</>
                            ) : (
                              <><Plus className="w-4 h-4" /> Add to Pipeline</>
                            )}
                          </button>
                        </div>
                        <button 
                          onClick={() => setSelectedCandidate(candidate)}
                          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
                        >
                          View Full Profile <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </main>
      
      {/* Slide-Over candidate profile drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white z-10 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pulse Score:</span>
                  <span className="text-xl font-black text-indigo-600">{selectedCandidate.pulseScore}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)} 
                className="p-2 bg-slate-100/80 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content (scrollable) */}
            <div className="p-8 space-y-10 flex-1 overflow-y-auto">
              
              {/* About Section */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">About</h3>
                <p className="text-slate-700 leading-relaxed text-lg">{selectedCandidate.about}</p>
              </section>

              {/* Tech Stack */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Stats Grid */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Experience</p>
                    <p className="text-base font-bold text-slate-900">{selectedCandidate.experience}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Notice Period</p>
                    <p className="text-base font-bold text-slate-900">{selectedCandidate.noticePeriod}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Location</p>
                    <p className="text-base font-bold text-slate-900">{selectedCandidate.location}</p>
                  </div>
                </div>
              </section>

              {/* Mock Verification */}
              <section className="space-y-3 pb-8">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Verified Platforms</h3>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">GitHub Verified</span>
                    <span className="text-emerald-700 text-sm ml-auto border border-emerald-200 bg-emerald-100/50 px-2 py-0.5 rounded-lg">Top 10%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">LeetCode Verified</span>
                    <span className="text-emerald-700 text-sm ml-auto border border-emerald-200 bg-emerald-100/50 px-2 py-0.5 rounded-lg">150+ solved</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-6 bg-white border-t border-slate-100 flex-shrink-0">
              <button 
                onClick={() => {
                  handleAddToPipeline(selectedCandidate.id);
                  setSelectedCandidate(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl text-base font-bold hover:bg-slate-800 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" /> Shortlist & Add to Pipeline
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
