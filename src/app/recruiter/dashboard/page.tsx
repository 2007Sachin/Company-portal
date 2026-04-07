'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, Send, ChevronRight, User, Shield, LogOut } from 'lucide-react';

export default function RecruiterDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link
            href="/recruiter/discover"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Discovery
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Candidate Pipeline</h1>
          <p className="text-slate-500 mt-1">Active Req: Senior Product Analyst</p>
        </div>
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </span>
          <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              R
            </div>
            <Link href="/auth/login" className="text-slate-400 hover:text-red-500 transition-colors" title="Log out">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[75vh]">

        {/* Column 1: SAVED FOR REVIEW */}
        <div className="bg-slate-100 rounded-3xl p-6 h-full flex flex-col gap-4">
          <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Saved (3)</h3>

          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-slate-900">Sarah Jenkins</span>
              </div>
              <span className="text-blue-600 font-bold text-lg">710</span>
            </div>
            <p className="text-sm text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Matched 2 hrs ago
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button className="flex-1 text-sm text-slate-500 hover:text-slate-700 font-medium py-2 rounded-xl hover:bg-slate-50 transition-colors">
                Review
              </button>
              <button className="flex-1 text-sm bg-blue-50 text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-100 transition-colors">
                Shortlist
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-bold text-slate-900">Marcus Rivera</span>
              </div>
              <span className="text-blue-600 font-bold text-lg">685</span>
            </div>
            <p className="text-sm text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Matched 5 hrs ago
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button className="flex-1 text-sm text-slate-500 hover:text-slate-700 font-medium py-2 rounded-xl hover:bg-slate-50 transition-colors">
                Review
              </button>
              <button className="flex-1 text-sm bg-blue-50 text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-100 transition-colors">
                Shortlist
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-bold text-slate-900">Priya Desai</span>
              </div>
              <span className="text-blue-600 font-bold text-lg">720</span>
            </div>
            <p className="text-sm text-slate-400 mt-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Matched 1 day ago
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button className="flex-1 text-sm text-slate-500 hover:text-slate-700 font-medium py-2 rounded-xl hover:bg-slate-50 transition-colors">
                Review
              </button>
              <button className="flex-1 text-sm bg-blue-50 text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-100 transition-colors">
                Shortlist
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: THE SHORTLIST */}
        <div className="bg-slate-100/80 rounded-3xl p-6 h-full flex flex-col gap-4">
          <h3 className="text-sm font-bold tracking-widest text-blue-600 uppercase">Shortlisted (1)</h3>

          {/* VIP Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-blue-900/5 relative overflow-hidden">
            {/* Accent strip */}
            <div className="w-1 h-full bg-blue-600 absolute left-0 top-0 rounded-l-2xl" />

            <div className="pl-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">Alex Chen</span>
                </div>
                <span className="text-blue-600 font-bold text-lg">810</span>
              </div>

              <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs mt-3 w-fit font-medium">
                Top 5% Cohort
              </span>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <span>Verified across 3 platforms</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>92% match to req</span>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white rounded-xl py-3 mt-5 font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Request Interview
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: INTERVIEW REQUESTED */}
        <div className="bg-slate-50 rounded-3xl p-6 h-full flex flex-col gap-4 opacity-75">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Pending (1)</h3>

          {/* Pending Card */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <span className="font-bold text-slate-900">Candidate #492 (Stealth)</span>
            </div>
            <p className="text-amber-600 mt-3 text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Awaiting Candidate Reply
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
