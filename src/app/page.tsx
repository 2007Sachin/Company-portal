'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Search, ArrowRight, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
      {/* Brand Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Project Pulse</h1>
        <p className="text-slate-500">Signal Over Noise. Choose your portal to continue.</p>
      </div>

      {/* Split Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Candidate Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:scale-105 transition-transform duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">For Candidates</h2>
          <p className="text-slate-600 mt-4 mb-8 leading-relaxed">
            Access your Verified Portfolio, track your Pulse Score, and apply to high-signal roles.
          </p>
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white rounded-full px-8 py-3 font-medium block text-center w-full hover:bg-blue-700 transition-colors"
          >
            <span className="inline-flex items-center justify-center gap-2">
              Enter as Candidate <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* Recruiter Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl hover:scale-105 transition-transform duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-slate-700 transition-colors">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">For Recruiters</h2>
          <p className="text-slate-400 mt-4 mb-8 leading-relaxed">
            Access the Precision Search Engine. Hire top 5% talent verified by real data.
          </p>
          <Link
            href="/recruiter/dashboard"
            className="bg-white text-slate-900 rounded-full px-8 py-3 font-medium block text-center w-full hover:bg-slate-100 transition-colors"
          >
            <span className="inline-flex items-center justify-center gap-2">
              Enter as Recruiter <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-slate-400">&copy; 2025 Project Pulse. Activity-as-Pedigree.</p>
    </div>
  );
}
