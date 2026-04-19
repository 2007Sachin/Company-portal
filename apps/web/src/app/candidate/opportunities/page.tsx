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
  ExternalLink
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { 
  getMyMatches, 
  saveMatch, 
  dismissMatch, 
  recomputeOpportunities, 
  expressInterest,
  getMyInterests,
  copilotDraftIntro,
  getCandidateMe
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────

type TabType = 'matched' | 'saved' | 'engaged';

// ── Components ─────────────────────────────────────────────

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('matched');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchMatches = async () => {
    setLoading(true);
    if (activeTab === 'engaged') {
      const res = await getMyInterests();
      if (res.ok) setMatches(await res.json());
    } else {
      const res = await getMyMatches(activeTab === 'saved');
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    getCandidateMe().then(async (res) => {
      if (res.ok) setProfile(await res.json());
    });
  }, [activeTab]);

  const handleRecompute = async () => {
    setScanning(true);
    const res = await recomputeOpportunities();
    if (res.ok) {
      const data = await res.json();
      alert(`Radar scan complete! Found ${data.matches_found} new opportunities.`);
      fetchMatches();
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header title="Opportunities" backTo="/candidate/dashboard" />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Actions & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {[
              { id: 'matched', label: 'Matched for you' },
              { id: 'saved', label: 'Saved' },
              { id: 'engaged', label: 'Engaged' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRecompute}
            disabled={scanning}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {scanning ? 'Scanning radar...' : 'Scan for Opportunities'}
          </button>
        </div>

        {/* List Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-slate-400 text-sm font-bold">Opportunity Agent is organizing your feed...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-32 text-center space-y-6 bg-white rounded-[40px] border border-dashed border-slate-200 px-8">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                  <Search className="w-10 h-10" />
               </div>
               <div className="space-y-2 max-w-md mx-auto">
                 <h3 className="text-xl font-black text-slate-900">No matches found yet</h3>
                 <p className="text-slate-500 text-sm leading-relaxed">
                   Your Opportunity Agent is scanning thousands of roles. Reach out to the <span className="text-indigo-600">Score Coach</span> or complete a <span className="text-indigo-600">Skill Assessment</span> to strengthen your profile and unlock more matches.
                 </p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {matches.map(m => (
                <OpportunityCard 
                  key={m.id} 
                  match={m} 
                  tab={activeTab} 
                  profile={profile}
                  onUpdate={fetchMatches} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Opportunity Card ───────────────────────────────────────

function OpportunityCard({ match, tab, profile, onUpdate }: { match: any, tab: TabType, profile: any, onUpdate: () => void }) {
  const [showInterestModal, setShowInterestModal] = useState(false);
  const jd = match.parsed_jds || match.parsed_jd;

  const handleSave = async () => {
    await saveMatch(match.id, !match.saved_at);
    onUpdate();
  };

  const handleDismiss = async () => {
    if (confirm('Dismiss this opportunity? It will no longer show up in your matches.')) {
      await dismissMatch(match.id);
      onUpdate();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 hover:shadow-md transition-all group relative overflow-hidden">
      {/* Match Score Badge */}
      <div className={`absolute top-0 right-10 px-4 py-2 rounded-b-2xl border-x border-b text-xs font-black uppercase tracking-widest ${getScoreColor(match.match_score)}`}>
        {match.match_score}% Match
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{jd.role_title}</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> High-Growth Fintech</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {jd.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {match.matched_skills?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> {s}
                </span>
              ))}
              {match.missing_skills?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold flex items-center gap-1 group/skill">
                   {s}
                   <a href="/candidate/copilot?agent=score-coach" className="opacity-0 group-hover/skill:opacity-100 text-[10px] text-indigo-500 underline ml-1">Learn this</a>
                </span>
              ))}
            </div>

            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
               <p className="text-sm text-indigo-900 italic font-medium leading-relaxed">
                 &ldquo;{match.why_you}&rdquo;
               </p>
               {match.growth_opportunity && (
                 <p className="mt-2 text-[11px] text-indigo-400 font-bold uppercase tracking-tight">
                    Growth: {match.growth_opportunity}
                 </p>
               )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 flex-shrink-0 md:min-w-[180px]">
          {tab === 'engaged' ? (
             <div className="space-y-4 text-center">
                <div className="px-4 py-3 bg-amber-50 text-amber-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                   <Clock className="w-4 h-4" /> Pending
                </div>
                <p className="text-[10px] font-bold text-slate-400">Sent on {new Date(match.created_at).toLocaleDateString()}</p>
             </div>
          ) : (
            <>
              <button 
                onClick={() => setShowInterestModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg"
              >
                <Zap className="w-4 h-4" />
                Express Interest
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 transition-all ${
                    match.saved_at 
                      ? 'bg-rose-50 border-rose-100 text-rose-500' 
                      : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <Star className={`w-4 h-4 ${match.saved_at ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleDismiss}
                  className="flex-1 flex items-center justify-center py-3 border-2 border-slate-100 text-slate-400 rounded-xl hover:border-red-100 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showInterestModal && (
        <InterestModal 
          match={match} 
          jd={jd} 
          profile={profile}
          onClose={() => setShowInterestModal(false)} 
          onSuccess={() => { setShowInterestModal(false); onUpdate(); }}
        />
      )}
    </div>
  );
}

// ── Interest Modal ─────────────────────────────────────────

function InterestModal({ match, jd, profile, onClose, onSuccess }: { match: any, jd: any, profile: any, onClose: () => void, onSuccess: () => void }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const getDraft = async () => {
      const res = await copilotDraftIntro({
        candidate_id: profile.id,
        candidate_full_profile: profile,
        parsed_jd: jd,
        match_context: {
          matched_skills: match.matched_skills,
          why_you: match.why_you,
          missing_skills: match.missing_skills
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft_text);
      } else if (res.status === 429) {
        setLimitReached(true);
      }
      setLoading(false);
    };
    getDraft();
  }, [profile, jd]);

  const handleSend = async () => {
    setSending(true);
    // Writes to candidate_interest table via updated endpoint
    const res = await expressInterest({ jd_id: jd.id, message: draft });
    if (res.ok) onSuccess();
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900">Personalized Intro</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Opportunity Agent is working</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="py-12 space-y-4 text-center">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
               <p className="text-slate-400 text-sm font-black animate-pulse">Drafting your customized pitch...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Intro Message</label>
                <textarea 
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  className="w-full h-64 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-indigo-500/20 text-slate-700 font-medium leading-relaxed resize-none"
                  placeholder="Tell the recruiter why you're a fit..."
                />
              </div>

              {limitReached && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
                   <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                   <p className="text-xs text-amber-700 font-bold leading-tight">
                     You&apos;ve reached your limit of 5 agent-drafted intros per day. Please customize this one manually to focus on your strengths.
                   </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                 <p className="text-[10px] text-slate-400 font-bold max-w-[280px]">
                   A personalized intro increases response rates by 40%. Verify your skills to get even better drafts.
                 </p>
                 <div className="flex gap-3">
                   <button onClick={onClose} className="px-8 py-3.5 text-sm font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200">Cancel</button>
                   <button 
                    onClick={handleSend}
                    disabled={sending || !draft}
                    className="px-8 py-3.5 text-sm font-black text-white bg-slate-900 rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center gap-2"
                   >
                     {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
