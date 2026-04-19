'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Terminal, 
  Zap, 
  Briefcase, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  Inbox,
  Sparkles,
  ArrowUpRight,
  Shield,
  Search
} from 'lucide-react';
import { Header } from '@pulse/ui';
import { getRecruiterRequests, respondToCandidateRequest } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ── Components ─────────────────────────────────────────────

export default function RecruiterRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await getRecruiterRequests();
    if (res.ok) {
      setRequests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
               <Inbox className="w-5 h-5" />
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-900">Inbound Talent</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Interest Radar</p>
            </div>
         </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-10">
         {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Pipeline...</p>
            </div>
         ) : requests.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200 px-8">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200 mb-6">
                  <Search className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">No inbound interests</h3>
               <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                  Job applications and expressed interest will appear here. Consider promoting your JDs via the Copilot to reach more candidates.
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-6">
               {requests.map(req => (
                  <RequestCard key={req.id} request={req} onUpdate={() => fetchRequests()} />
               ))}
            </div>
         )}
      </main>
    </div>
  );
}

// ── Request Card ───────────────────────────────────────────

function RequestCard({ request, onUpdate }: { request: any, onUpdate: () => void }) {
  const [responding, setResponding] = useState(false);
  const candidate = request.candidates;
  const jd = request.parsed_jds;

  const handleRespond = async (status: 'accepted' | 'declined') => {
    setResponding(true);
    const res = await respondToCandidateRequest(request.id, status);
    if (res.ok) onUpdate();
    setResponding(false);
  };

  return (
    <div className={cn(
       "bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 hover:shadow-md transition-all relative group overflow-hidden",
       request.status === 'pending' ? "border-indigo-200" : "opacity-75"
    )}>
       <div className="flex flex-col md:flex-row gap-10">
          
          {/* Candidate Profile Summary */}
          <div className="flex-1 space-y-6">
             <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 relative">
                   <User className="w-8 h-8" />
                   {candidate.pulse_score > 90 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                         <Zap className="w-3 h-3 text-white fill-current" />
                      </div>
                   )}
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {request.status === 'accepted' ? (candidate.full_name || 'Verified Talent') : `Candidate #${candidate.id.split('-')[0]}`}
                   </h3>
                   <p className="text-sm font-bold text-slate-500">{candidate.headline}</p>
                   <div className="flex flex-wrap gap-2 mt-2">
                       {candidate.skills?.slice(0, 4).map((s: string) => (
                          <span key={s} className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{s}</span>
                       ))}
                   </div>
                </div>
             </div>

             <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                   <Sparkles className="w-3 h-3" /> Intro Pitch
                </div>
                <p className="text-sm text-indigo-900 font-medium leading-relaxed mt-2 italic">
                   &ldquo;{request.message}&rdquo;
                </p>
             </div>
          </div>

          {/* Match & Actions */}
          <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-10 space-y-6">
             <div className="text-center md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Role</p>
                <h4 className="text-sm font-black text-slate-900 leading-tight mb-2">{jd.role_title}</h4>
                <div className="flex items-center justify-center md:justify-end gap-3">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pulse Score</p>
                      <p className="text-xl font-black text-indigo-600 leading-none">{candidate.pulse_score}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                      <div className="text-[10px] font-black text-indigo-600">{candidate.pulse_score}</div>
                   </div>
                </div>
             </div>

             {request.status === 'pending' ? (
                <div className="space-y-3">
                   <button 
                      onClick={() => handleRespond('accepted')}
                      disabled={responding}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                      {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      Unlock Profile
                   </button>
                   <button 
                      onClick={() => handleRespond('declined')}
                      disabled={responding}
                      className="w-full py-3.5 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-red-100 hover:text-red-500 transition-all"
                   >
                      Pass
                   </button>
                </div>
             ) : (
                <div className="text-center">
                   <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                      request.status === 'accepted' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600 shadow-none"
                   )}>
                      {request.status === 'accepted' ? <><Check className="w-4 h-4" /> Unlocked</> : <><X className="w-4 h-4" /> Passed</>}
                   </div>
                   {request.status === 'accepted' && (
                      <button className="mt-4 w-full py-2.5 text-xs font-black text-indigo-600 flex items-center justify-center gap-1 group">
                         Start Chat <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
