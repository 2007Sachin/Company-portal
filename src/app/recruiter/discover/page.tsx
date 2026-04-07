'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Search, 
  SlidersHorizontal, 
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
  AlertCircle
} from 'lucide-react';

export default function TalentDiscoveryPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Pulse.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/recruiter/dashboard" 
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Go to Pipeline
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
            R
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

              {/* Tech Stack */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Tech Stack</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Add skill..." 
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['React', 'TypeScript', 'Next.js'].map(tech => (
                    <span key={tech} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer group">
                      {tech}
                      <X className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                    </span>
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

              <div className="h-px bg-slate-100 -mx-5"></div>

              {/* Verification */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Verification</label>
                <div className="space-y-2.5">
                  {['GitHub Verified', 'LeetCode Verified', 'Has Video Pitch'].map((verif, i) => (
                    <label key={verif} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" defaultChecked={i !== 2} className="peer sr-only" />
                        <div className="w-4.5 h-4.5 border border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors group-hover:border-indigo-400"></div>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{verif}</span>
                    </label>
                  ))}
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
              <span className="font-bold">42</span> candidates found
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
            
            {/* Candidate Card 1 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left Area: Avatar & Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between sm:justify-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Candidate #1042</h3>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Full Stack Developer | Bangalore</p>
                    </div>
                  </div>

                  {/* Readiness Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold tracking-wide">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Immediate Joiner
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-semibold tracking-wide">
                      🔥 Top 5% in React
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 text-slate-400" /> GitHub Verified
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-5 text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Experience: 4 Yrs</span>
                    <span className="text-slate-300">•</span>
                    <span>Notice: 15 Days</span>
                    <span className="text-slate-300">•</span>
                    <span>Active: 2 hrs ago</span>
                  </div>
                </div>

                {/* Right Area: Score & Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                  <div className="text-left sm:text-right w-full">
                    <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Pulse Score</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">785</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all shadow-sm group/btn">
                        <Heart className="w-4 h-4 group-hover/btn:fill-current" />
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-1">
                        <Plus className="w-4 h-4" /> Add to Pipeline
                      </button>
                    </div>
                    <Link href="#" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View Full Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Card 2 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left Area: Avatar & Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between sm:justify-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Candidate #2819</h3>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Senior UI Engineer | Remote (India)</p>
                    </div>
                  </div>

                  {/* Readiness Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold tracking-wide">
                      <AlertCircle className="w-3 h-3" /> 30 Days Notice
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold tracking-wide">
                      <Zap className="w-3 h-3 text-blue-500" /> Ex-FAANG
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 text-slate-400" /> Fully Verified
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-5 text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Experience: 6 Yrs</span>
                    <span className="text-slate-300">•</span>
                    <span>Notice: 30 Days</span>
                    <span className="text-slate-300">•</span>
                    <span>Active: 1 day ago</span>
                  </div>
                </div>

                {/* Right Area: Score & Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                  <div className="text-left sm:text-right w-full">
                    <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Pulse Score</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">742</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all shadow-sm group/btn">
                        <Heart className="w-4 h-4 group-hover/btn:fill-current" />
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-1">
                        <Plus className="w-4 h-4" /> Add to Pipeline
                      </button>
                    </div>
                    <Link href="#" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View Full Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Card 3 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left Area: Avatar & Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between sm:justify-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Candidate #0921</h3>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Frontend Architect | Pune</p>
                    </div>
                  </div>

                  {/* Readiness Badges */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold tracking-wide">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Immediate Joiner
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 text-slate-400" /> GitHub Verified
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3 text-slate-400" /> LeetCode Verified
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-5 text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Experience: 8 Yrs</span>
                    <span className="text-slate-300">•</span>
                    <span>Notice: Immediate</span>
                    <span className="text-slate-300">•</span>
                    <span>Active: 5 mins ago</span>
                  </div>
                </div>

                {/* Right Area: Score & Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                  <div className="text-left sm:text-right w-full">
                    <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">Pulse Score</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">728</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-all shadow-sm group/btn flex-shrink-0">
                        <Heart className="w-4 h-4 group-hover/btn:fill-current" />
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/30 focus:ring-offset-1 flex-shrink-0">
                        <Plus className="w-4 h-4" /> Add to Pipeline
                      </button>
                    </div>
                    <Link href="#" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-1">
                      View Full Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
