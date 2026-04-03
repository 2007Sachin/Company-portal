'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl pulse-gradient flex items-center justify-center shadow-lg shadow-pulse-600/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-bold font-display text-white">Pulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pulse-500/10 border border-pulse-500/20 text-sm text-pulse-300">
            <span className="w-2 h-2 rounded-full bg-pulse-500 animate-pulse" />
            Now live — Activity-as-Pedigree
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight">
            Your code speaks.{' '}
            <span className="pulse-gradient-text">Let recruiters listen.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Replace your static resume with a <strong className="text-slate-200">live Pulse Score</strong>.
            Connect GitHub, LeetCode, and Medium to let your real coding activity do the talking.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8">
                Create Your Pulse Profile
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="text-base">
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 pt-8 text-center">
            {[
              { value: '40%', label: 'Faster hiring' },
              { value: '60%', label: 'Interview pass rate' },
              { value: '10K+', label: 'Active developers' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-bold font-display pulse-gradient-text">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <span>© 2024 Pulse. Activity-as-Pedigree.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
