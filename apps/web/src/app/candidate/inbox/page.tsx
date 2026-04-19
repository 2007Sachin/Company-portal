'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Bookmark, 
  Star, 
  Key, 
  Clock, 
  ChevronRight, 
  Check, 
  X, 
  Loader2, 
  Mail,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { getMyInterests, respondToInterest } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Types ──────────────────────────────────────────────────

type InboxStatus = 'all' | 'pending' | 'accepted' | 'declined';

// ── Components ─────────────────────────────────────────────

export default function CandidateInbox() {
  const [activeTab, setActiveTab] = useState<InboxStatus>('all');
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterests = async () => {
    setLoading(true);
    const res = await getMyInterests(activeTab);
    if (res.ok) {
      setInterests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInterests();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      <Header title="Recruiter Interest" backTo="/candidate/dashboard" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-10">
        
        {/* Filter Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto">
          {[
            { id: 'all', label: 'All Signals' },
            { id: 'pending', label: 'Requests' },
            { id: 'accepted', label: 'Connected' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InboxStatus)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                activeTab === tab.id 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inbox Grid */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-bold uppercase tracking-widest">Opening Secure Inbox...</p>
             </div>
          ) : interests.length === 0 ? (
             <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-200 px-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200 mb-6">
                   <Mail className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No signals yet</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                   When recruiters view, save, or request to connect with you, they will appear here. Keep your Pulse Score climbing!
                </p>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {interests.map(interest => (
                   <InterestCard 
                      key={interest.id} 
                      interest={interest} 
                      onUpdate={() => fetchInterests()} 
                   />
                ))}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Interest Card ──────────────────────────────────────────

function InterestCard({ interest, onUpdate }: { interest: any, onUpdate: () => void }) {
  const [responding, setResponding] = useState(false);
  const jd = interest.parsed_jds;

  const handleRespond = async (status: 'accepted' | 'declined') => {
    setResponding(true);
    const res = await respondToInterest(interest.id, status);
    if (res.ok) onUpdate();
    setResponding(false);
  };

  const getSignalMeta = (type: string) => {
    switch(type) {
      case 'viewed': return { label: 'Viewed Profile', icon: <Eye className="w-4 h-4" />, color: 'text-slate-400 bg-slate-50' };
      case 'saved': return { label: 'Saved candidate', icon: <Bookmark className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-50' };
      case 'shortlisted': return { label: 'Shortlisted', icon: <Star className="w-4 h-4" />, color: 'text-amber-500 bg-amber-50' };
      case 'unlock_requested': return { label: 'Connection Request', icon: <Key className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50' };
      default: return { label: 'System Signal', icon: <Mail className="w-4 h-4" />, color: 'text-slate-400 bg-slate-50' };
    }
  };

  const meta = getSignalMeta(interest.interest_type);

  return (
    <div className={cn(
       "bg-white rounded-[32px] border transition-all p-8 relative overflow-hidden group",
       interest.status === 'pending' ? "border-indigo-100 shadow-indigo-100/20 shadow-xl" : "border-slate-100"
    )}>
       {interest.status === 'pending' && (
          <div className="absolute top-0 right-10 px-4 py-1.5 bg-indigo-600 text-white rounded-b-xl text-[10px] font-black uppercase tracking-widest">
             Action Required
          </div>
       )}

       <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between">
             <div className="flex items-center gap-5">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", meta.color)}>
                   {meta.icon}
                </div>
                <div className="space-y-1">
                   <h4 className="font-black text-slate-900 text-lg">
                      {interest.interest_type === 'unlock_requested' ? 'Recruiter Connection' : meta.label}
                   </h4>
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> High-Growth Fintech</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(interest.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>
          </div>

          {interest.interest_type === 'unlock_requested' && interest.status === 'pending' && (
             <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-sm text-slate-600 italic leading-relaxed">
                   &ldquo;{interest.recruiter_message || 'I&apos;d love to connect and discuss your background for a potential opening at our company.'}&rdquo;
                </p>
                <div className="flex gap-3">
                   <button 
                      onClick={() => handleRespond('accepted')}
                      disabled={responding}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                   >
                      {responding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Accept Request
                   </button>
                   <button 
                      onClick={() => handleRespond('declined')}
                      disabled={responding}
                      className="px-6 py-2.5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:border-red-100 hover:text-red-500 transition-all"
                   >
                      Decline
                   </button>
                </div>
             </div>
          )}

          {interest.status === 'accepted' && (
             <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <CheckCircle2Icon /> Connected
             </div>
          )}

          {interest.status === 'declined' && (
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Request Declined
             </div>
          )}
          
          {jd && (
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regarding Role</p>
                  <p className="text-sm font-bold text-slate-700">{jd.role_title}</p>
               </div>
               <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">
                  {jd.location}
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function CheckCircle2Icon() {
   return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
