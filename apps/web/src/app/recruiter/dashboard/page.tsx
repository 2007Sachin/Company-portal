'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, Send, ChevronRight, User, Shield, LogOut, Loader2, X } from 'lucide-react';

interface CandidateData {
  id: string;
  headline: string;
  pulse_score: number;
}

interface PipelineEntry {
  id: string;
  stage: 'saved' | 'shortlisted' | 'pending';
  notes: string;
  created_at: string;
  candidate_id: string;
  candidates: CandidateData;
}

interface PipelineGroup {
  saved: PipelineEntry[];
  shortlisted: PipelineEntry[];
  pending: PipelineEntry[];
}

import { Header } from '@pulse/ui';
import { getPipeline, movePipelineStage, removeFromPipeline } from '@/lib/api';

export default function RecruiterDashboardPage() {
  const [pipeline, setPipeline] = useState<PipelineGroup>({ saved: [], shortlisted: [], pending: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      setIsLoading(true);
      const res = await getPipeline();
      const data = await res.json();
      setPipeline(data);
    } catch (err) {
      console.error('Fetch pipeline error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleMove = async (id: string, newStage: 'saved' | 'shortlisted' | 'pending') => {
    try {
      await movePipelineStage(id, newStage);
      fetchPipeline();
    } catch (err) {
      console.error('Failed to move candidate');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromPipeline(id);
      fetchPipeline();
    } catch (err) {
      console.error('Failed to delete candidate');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header title="Back to Discovery" backTo="/recruiter/discover" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Candidate Pipeline</h1>
            <p className="text-slate-500 mt-1">Manage shortlisted candidates dynamically</p>
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Sync
            </span>
          </div>
        </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 mt-8">
           <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        /* Kanban Board */
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-auto">

          {/* Column 1: SAVED FOR REVIEW */}
          <div className="bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 min-h-[500px]">
            <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Saved ({pipeline.saved.length})</h3>

            {pipeline.saved.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                <button 
                  onClick={() => handleRemove(entry.id)}
                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-lg hover:bg-red-50"
                  title="Remove from pipeline"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[120px]" title={`Candidate #${entry.candidate_id.split('-')[0]}`}>
                        {`C-${entry.candidate_id.substring(0,6)}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-lg">{entry.candidates?.pulse_score || 0}</span>
                </div>
                <p className="text-sm text-slate-400 mt-3 truncate">{entry.candidates?.headline}</p>
                <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Added {new Date(entry.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <button 
                    onClick={() => handleMove(entry.id, 'shortlisted')}
                    className="flex-1 text-sm bg-blue-50 text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Shortlist
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2: THE SHORTLIST */}
          <div className="bg-slate-100/80 rounded-3xl p-6 flex flex-col gap-4 min-h-[500px]">
            <h3 className="text-sm font-bold tracking-widest text-blue-600 uppercase">Shortlisted ({pipeline.shortlisted.length})</h3>

            {pipeline.shortlisted.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                <div className="w-1 h-full bg-blue-600 absolute left-0 top-0 rounded-l-2xl" />
                
                <button 
                  onClick={() => handleRemove(entry.id)}
                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-lg hover:bg-red-50 z-10"
                  title="Remove from pipeline"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="pl-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-slate-900 block truncate max-w-[100px]" title={`Candidate #${entry.candidate_id.split('-')[0]}`}>
                        {`C-${entry.candidate_id.substring(0,6)}`}
                      </span>
                    </div>
                    <span className="text-blue-600 font-bold text-lg pr-4">{entry.candidates?.pulse_score || 0}</span>
                  </div>

                  <p className="text-sm text-slate-500 mt-3 truncate">{entry.candidates?.headline}</p>

                  <div className="mt-4 flex gap-2">
                     <button 
                       onClick={() => handleMove(entry.id, 'saved')}
                       className="flex-1 text-xs text-slate-500 hover:text-slate-700 font-medium py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                     >
                       Demote
                     </button>
                     <button 
                       onClick={() => handleMove(entry.id, 'pending')}
                       className="flex-1 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 font-medium py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                     >
                       Request Intv
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3: INTERVIEW REQUESTED */}
          <div className="bg-slate-50 rounded-3xl p-6 flex flex-col gap-4 min-h-[500px]">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Pending ({pipeline.pending.length})</h3>

            {pipeline.pending.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl p-5 border border-slate-100 relative group">
                <button 
                  onClick={() => handleRemove(entry.id)}
                  className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-lg hover:bg-red-50 z-10"
                  title="Remove from pipeline"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-900 truncate">
                    {`C-${entry.candidate_id.substring(0,6)}`}
                  </span>
                </div>
                <p className="text-amber-600 mt-3 text-sm font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Awaiting Candidate Reply
                </p>
                <button 
                  onClick={() => handleMove(entry.id, 'shortlisted')}
                  className="text-xs text-slate-500 mt-4 hover:underline"
                >
                  Cancel request
                </button>
              </div>
            ))}
          </div>

        </div>
      )}
      </main>
    </div>
  );
}
