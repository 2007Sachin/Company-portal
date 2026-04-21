'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Search, 
  Send, 
  Loader2, 
  Briefcase, 
  MapPin, 
  Clock, 
  Zap, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { runConversationalSearch, evaluateJobMatch, applyWithAI } from '@/lib/api';

export function JobsIntelligence() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [introPreview, setIntroPreview] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await runConversationalSearch(query);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (matchId: string) => {
    setEvaluatingId(matchId);
    try {
      const res = await evaluateJobMatch(matchId);
      const data = await res.json();
      // Update the specific result with analysis
      setResults(prev => prev.map(r => r.id === matchId ? { ...r, analysis: data.analysis } : r));
      setSelectedMatch({ ...results.find(r => r.id === matchId), analysis: data.analysis });
    } catch (err) {
      console.error('Evaluation failed', err);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleApply = async () => {
    if (!selectedMatch) return;
    setApplying(true);
    try {
      await applyWithAI(selectedMatch.id, introPreview);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        setSelectedMatch(null);
      }, 3000);
    } catch (err) {
      console.error('Apply failed', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Zone */}
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full transition-all group-focus-within:bg-indigo-500/10" />
        <form 
          onSubmit={handleSearch}
          className="relative bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden ring-1 ring-slate-100 p-2 flex items-center"
        >
          <div className="p-4 text-indigo-600">
            <Bot className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="Search roles like 'React lead in Mumbai' or 'Remote startup with Node.js'..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="h-14 w-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition shadow-lg shadow-slate-900/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>

      {/* Results / Intelligence Feed */}
      <div className="space-y-6">
        {loading && results.length === 0 && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-slate-50 rounded-[32px] animate-pulse" />
            ))}
          </div>
        )}

        {results.map((match) => {
          const jd = match.parsed_jds || {};
          const analysis = match.analysis || null;
          
          return (
            <div 
              key={match.id}
              className={cn(
                "group bg-white rounded-[32px] border border-slate-200 overflow-hidden transition-all hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5",
                selectedMatch?.id === match.id && "border-indigo-600 ring-4 ring-indigo-50"
              )}
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{jd.role_title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {jd.company_type || 'Startup'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {jd.location}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {jd.notice_period_days}d Notice</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {(match.matched_skills || []).slice(0, 5).map((skill: string) => (
                         <span key={skill} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-emerald-100">
                           {skill}
                         </span>
                       ))}
                       {(match.missing_skills || []).slice(0, 2).map((skill: string) => (
                         <span key={skill} className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-amber-100">
                           Gap: {skill}
                         </span>
                       ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-center min-w-[120px]">
                      <p className="text-3xl font-black text-indigo-600">{Math.round(match.match_score)}%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Score</p>
                    </div>
                    {!analysis ? (
                      <button 
                        onClick={() => handleEvaluate(match.id)}
                        disabled={evaluatingId === match.id}
                        className="h-12 w-full lg:w-48 bg-slate-900 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                      >
                        {evaluatingId === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Run Evaluation
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedMatch(match)}
                        className="h-12 w-full lg:w-48 bg-indigo-600 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                      >
                        Apply with AI
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Analysis Breakdown */}
                {analysis && (
                  <div className="mt-8 pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600">
                           <Lightbulb className="w-4 h-4" />
                           <p className="text-xs font-black uppercase tracking-widest">Why You?</p>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{analysis.why_you || "Your technical background aligns with the core requirements."}</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                           <AlertTriangle className="w-4 h-4" />
                           <p className="text-xs font-black uppercase tracking-widest">Gaps to Close</p>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{analysis.growth_opportunity || "Deepening expertise in some specific framework requirements would strengthen this match."}</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Conversational Job Discovery</h4>
            <p className="text-slate-500 mt-2 max-w-sm font-medium">Ask Pulse things like "Show me Bangalore roles matching my React skills with {">"}20L salary"</p>
          </div>
        )}
      </div>

      {/* Apply Slide-over (simplified for this view) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">AI-Assisted Application</p>
                   <h3 className="text-3xl font-black text-slate-900 mt-1">{selectedMatch.parsed_jds?.role_title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {applied ? (
                 <div className="py-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">Interest Sent!</h4>
                    <p className="text-slate-500 font-medium">Your AI-matched intro has been shared with the recruiter.</p>
                 </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-xs font-black uppercase tracking-widest text-slate-400">Agent Drafted Intro</p>
                       <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                          Personalized
                       </span>
                    </div>
                    <textarea 
                      className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 min-h-[160px] focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
                      placeholder="Generating personalized intro..."
                      value={introPreview}
                      onChange={(e) => setIntroPreview(e.target.value)}
                    />
                    <div className="flex items-center gap-2 px-2">
                       <Zap className="w-4 h-4 text-indigo-600" />
                       <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Powered by Pulse Insights Agent</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 h-16 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {applying ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                      Send Matched Interest
                    </button>
                    <button 
                      onClick={() => setSelectedMatch(null)}
                      className="px-8 h-16 border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
