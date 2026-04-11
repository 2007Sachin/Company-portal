'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Link2, User, Keyboard, Activity, ArrowRight, LogOut } from 'lucide-react';

export default function RecruiterSearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setIsSubmitting(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push('/recruiter/discover');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handlePillClick = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 relative z-10">
        <Link href="/recruiter/login" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Pulse</span>
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors mr-2"
          >
            Pipeline
          </Link>
          <div className="flex items-center gap-4 pl-2 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              R
            </div>
            <Link href="/auth/login" className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Center Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="w-full max-w-2xl space-y-8">
          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
              Who are you looking
              <br />
              to hire today?
            </h1>
            <p className="text-gray-400 text-base">
              Describe the role and let Pulse find verified matches instantly.
            </p>
          </div>

          {/* Magic Input Bar */}
          <div
            className={`relative group transition-all duration-300 ${
              isFocused
                ? 'scale-[1.02]'
                : ''
            }`}
          >
            {/* Glow ring */}
            <div
              className={`absolute -inset-0.5 rounded-2xl transition-all duration-500 ${
                isFocused
                  ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-sm opacity-100'
                  : 'opacity-0'
              }`}
            />

            <div
              className={`relative flex items-center bg-white rounded-2xl border-2 transition-all duration-300 ${
                isFocused
                  ? 'border-indigo-400 shadow-lg shadow-indigo-500/10'
                  : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Paste a Job Description link, or type your requirements..."
                className="flex-1 px-6 py-5 text-lg bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none rounded-2xl"
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || isSubmitting}
                className={`mr-3 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${
                  query.trim()
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-default'
                } ${isSubmitting ? 'animate-pulse' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className={`w-5 h-5 transition-transform duration-300 ${query.trim() ? 'scale-100' : 'scale-90'}`} />
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => handlePillClick('https://linkedin.com/jobs/view/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                         bg-gray-50 text-gray-600 border border-gray-200
                         hover:bg-gray-100 hover:border-gray-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                         transition-all duration-200 group"
            >
              <Link2 className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              Paste JD Link
            </button>

            <button
              onClick={() => handlePillClick('Find someone like linkedin.com/in/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                         bg-gray-50 text-gray-600 border border-gray-200
                         hover:bg-gray-100 hover:border-gray-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                         transition-all duration-200 group"
            >
              <User className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              Clone LinkedIn Profile
            </button>

            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                         bg-gray-50 text-gray-600 border border-gray-200
                         hover:bg-gray-100 hover:border-gray-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                         transition-all duration-200 group"
            >
              <Keyboard className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              Just type it out
            </button>
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="pb-6 text-center">
        <p className="text-xs text-gray-300">
          Powered by verified activity data from GitHub, LeetCode & Medium
        </p>
      </footer>
    </div>
  );
}
