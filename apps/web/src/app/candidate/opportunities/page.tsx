'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Star, 
  Trash2, 
  Send, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Info,
  Sparkles,
  Search,
  Check,
  X,
  ExternalLink,
  Filter,
  ArrowUpRight,
  Target,
  TrendingUp,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getCandidateMatchesV2,
  updateCandidateMatch,
  expressInterestForMatch,
  computeCandidateMatches,
  getCandidateMe,
  copilotDraftIntro,
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

type TabType = 'matched' | 'saved' | 'engaged';

// ── Components ─────────────────────────────────────────────

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('matched');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'engaged') {
        res = await getCandidateMatchesV2('engaged');
      } else if (activeTab === 'saved') {
        res = await getCandidateMatchesV2(undefined, true);
      } else {
        res = await getCandidateMatchesV2();
      }
      
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  useEffect(() => {
    getCandidateMe().then(async (res) => {
      if (res.ok) setProfile(await res.json());
    });
  }, []);

  const handleCompute = async () => {
    setComputing(true);
    try {
      await computeCandidateMatches();
      fetchMatches();
    } catch (e) {
      console.error(e);
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Opportunity Radar" />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Radar.</h1>
            <p className="text-slate-500 font-medium mt-1">Real-time matches based on your proof-of-work signals.</p>
          </div>
          
          <button 
            onClick={handleCompute}
            disabled={computing}
            className="group relative flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
          >
            {computing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
            Refresh Radar
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar / Tabs */}
          <aside className="w-full md:w-64 space-y-2">
            {[
              { id: 'matched', label: 'Best Matches', icon: Target, color: 'text-indigo-600' },
              { id: 'saved', label: 'Saved Roles', icon: Star, color: 'text-amber-500' },
              { id: 'engaged', label: 'Engaged', icon: Send, color: 'text-emerald-500' }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                    activeTab === tab.id 
                      ? 'bg-white shadow-lg border border-slate-100 text-slate-900' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </button>
              );
            })}
          </aside>

          {/* Main Feed */}
          <section className="flex-1 space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-200/50 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Target Acquired, but no matches yet.</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  The radar is clear. Try updating your <span className="text-indigo-600 font-bold">Preferences</span> or increasing your <span className="text-indigo-600 font-bold">Pulse Score</span> to unlock more high-fidelity opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {matches.map(m => (
                  <OpportunityCard 
                    key={m.id} 
                    match={m} 
                    profile={profile}
                    onUpdate={fetchMatches} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function OpportunityCard({ match, profile, onUpdate }: { match: any; profile: any; onUpdate: () => void }) {
  const [expanding, setExpanding] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const jd = match.parsed_jds || match.parsed_jd || {};

  const handleAction = async (update: any) => {
    await updateCandidateMatch(match.id, update);
    onUpdate();
  };

  const scoreColor = match.match_score >= 90 ? 'bg-emerald-500' : match.match_score >= 75 ? 'bg-indigo-500' : 'bg-amber-500';

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Score & Logo */}
          <div className="flex md:flex-col items-center gap-4">
             <div className="relative">
               <svg className="w-24 h-24 transform -rotate-90">
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                 <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                   strokeDasharray={251.2} 
                   strokeDashoffset={251.2 * (1 - match.match_score / 100)} 
                   className={`${match.match_score >= 90 ? 'text-emerald-500' : 'text-indigo-500'} transition-all duration-1000`} 
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-lg font-black text-slate-900">{match.match_score}%</span>
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Fit</span>
               </div>
             </div>
             {match.saved_at && <Star className="w-5 h-5 text-amber-400 fill-current" />}
          </div>

          {/* Middle: Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{jd.role_title}</h3>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Global Tech Corp</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {jd.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {jd.ctc_min}-{jd.ctc_max}L</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {match.matched_skills?.slice(0, 4).map((s: string) => (
                <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  {s}
                </span>
              ))}
              {match.missing_skills?.length > 0 && (
                <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">
                  +{match.missing_skills.length} gaps
                </span>
              )}
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
              &ldquo;{match.why_you || "Our AI agent identified a strong alignment between your project history and this role's core challenges."}&rdquo;
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col justify-end gap-3 md:w-48">
            <button 
              onClick={() => setShowIntro(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-200"
            >
              <Zap className="w-4 h-4 fill-current" /> Express Interest
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction({ saved: !match.saved_at })}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${match.saved_at ? 'bg-amber-50 border-amber-200 text-amber-500' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                <Star className={`w-5 h-5 ${match.saved_at ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => handleAction({ status: 'dismissed' })}
                className="flex-1 flex items-center justify-center py-3 border-2 border-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Match Insights */}
      <div className={`bg-slate-50/50 border-t border-slate-100 p-8 pt-0 transition-all duration-500 ${expanding ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Match Reasoning</h4>
             <div className="space-y-3">
               {match.matched_skills?.map((s: string) => (
                 <div key={s} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strong {s} signals found in your Proof.
                 </div>
               ))}
             </div>
          </div>
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Opportunities</h4>
             <p className="text-sm text-slate-500 italic leading-relaxed">
               This role would allow you to expand your expertise in <span className="font-bold text-slate-900">{match.missing_skills?.[0] || 'System Design'}</span>.
             </p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setExpanding(!expanding)}
        className="w-full py-3 bg-white border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
      >
        {expanding ? <X className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 rotate-90" />}
        {expanding ? "Hide Details" : "View Match Breakdown"}
      </button>

      {showIntro && (
        <InterestModal 
          match={match} 
          jd={jd} 
          profile={profile} 
          onClose={() => setShowIntro(false)} 
          onSuccess={() => { setShowIntro(false); onUpdate(); }} 
        />
      )}
    </div>
  );
}

function InterestModal({ match, jd, profile, onClose, onSuccess }: any) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await copilotDraftIntro({
        candidate_id: profile.id,
        candidate_full_profile: profile,
        parsed_jd: jd,
        match_context: {
          matched_skills: match.matched_skills,
          why_you: match.why_you
        }
      });
      if (res.ok) {
        const d = await res.json();
        setDraft(d.draft_text);
      }
      setLoading(false);
    }
    load();
  }, [profile, jd]);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await expressInterestForMatch(match.id, draft);
      if (res.ok) onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
               <Sparkles className="w-7 h-7" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900">Personalized Intro</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opportunity Agent Draft</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
               <p className="text-slate-400 font-bold text-sm animate-pulse">Drafting customized pitch...</p>
            </div>
          ) : (
            <>
              <textarea 
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="w-full h-72 px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500/20 text-slate-700 font-medium leading-relaxed resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold max-w-[300px]">
                  Wait! Recruiters love seeing real projects. Verify your GitHub to make this draft even better.
                </p>
                <div className="flex gap-4">
                  <button onClick={onClose} className="px-8 py-4 text-slate-400 font-black text-sm hover:text-slate-600">Cancel</button>
                  <button 
                    onClick={handleSend}
                    disabled={sending}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Interest
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
