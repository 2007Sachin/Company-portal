'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-pulse-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-800">Pulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-chip bg-white border border-slate-200 text-sm text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-pulse-600" />
            Now live — Activity-as-Pedigree
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Your code speaks.{' '}
            <span className="text-pulse-600">Let recruiters listen.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Replace your static resume with a <strong className="text-slate-700">live Pulse Score</strong>.
            Connect GitHub, LeetCode, and Medium to let your real coding activity do the talking.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/auth/signup">
              <Button size="lg">
                Create your Pulse profile
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </div>

          {/* Feature Cards - Pathwisse style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
            {[
              { icon: '📊', iconBg: 'bg-blue-50 text-blue-600', title: 'Live Pulse Score', desc: 'Real-time score from your coding activity' },
              { icon: '🔗', iconBg: 'bg-green-50 text-green-600', title: 'Connect platforms', desc: 'GitHub, LeetCode, and Medium in one place' },
              { icon: '🎯', iconBg: 'bg-amber-50 text-amber-600', title: 'Get discovered', desc: 'Recruiters find you based on real work' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-card border border-slate-200 p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-card ${feature.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{feature.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{feature.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>&copy; 2025 Pulse. Activity-as-Pedigree.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
