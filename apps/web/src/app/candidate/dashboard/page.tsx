'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Target,
  Sparkles,
  Eye,
  Github,
  Code2,
  Video,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { Header } from '@pulse/ui';
import {
  getCandidateMe,
  getCandidateMatches,
  getCandidateViews,
  getCandidateStreak,
  getAgentSuggestions,
  getTodayChallenge,
  completeChallenge,
  updateSuggestionStatus
} from '@/lib/api';
import type { Candidate, CandidateMatch, ProfileView, CandidateStreak, AgentSuggestion } from '@pulse/shared-types';

export default function CandidateDashboard() {
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [views, setViews] = useState<{ total_views: number, recent: ProfileView[] }>({ total_views: 0, recent: [] });
  const [streak, setStreak] = useState<CandidateStreak | null>(null);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);

  // We mock a challenge here for frontend purposes since daily_challenges API wasn't explicitly added to fetch random ones, 
  // but we can post to complete it.
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          meRes,
          matchesRes,
          viewsRes,
          streakRes,
          suggestionsRes,
          challengeRes
        ] = await Promise.allSettled([
          getCandidateMe(),
          getCandidateMatches(),
          getCandidateViews(),
          getCandidateStreak(),
          getAgentSuggestions(),
          getTodayChallenge()
        ]);

        if (meRes.status === 'fulfilled' && meRes.value.ok) {
          setCandidate(await meRes.value.json());
        }
        if (matchesRes.status === 'fulfilled' && matchesRes.value.ok) {
          const data = await matchesRes.value.json();
          setMatches(data.matches || []);
        }
        if (viewsRes.status === 'fulfilled' && viewsRes.value.ok) {
          setViews(await viewsRes.value.json());
        }
        if (streakRes.status === 'fulfilled' && streakRes.value.ok) {
          setStreak(await streakRes.value.json());
        }
        if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value.ok) {
          const data = await suggestionsRes.value.json();
          setSuggestions(data.suggestions || []);
        }
        if (challengeRes.status === 'fulfilled' && challengeRes.value.ok) {
          const data = await challengeRes.value.json();
          setChallenge(data);
          setChallengeCompleted(!!data.completed_at);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleCompleteChallenge = async () => {
    if (!challenge || challengeCompleted) return;
    
    try {
      setCelebrating(true);
      const res = await completeChallenge(challenge.id);
      if (res.ok) {
        setChallengeCompleted(true);
        const streakData = await res.json();
        setStreak(streakData);
        // Celebration timeout
        setTimeout(() => setCelebrating(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setCelebrating(false);
    }
  };

  const handleSuggestionAction = async (id: string, status: 'accepted' | 'dismissed') => {
    try {
      await updateSuggestionStatus(id, status);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      // Optimistic update for demo purposes
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Dashboard" />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-64 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-32 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const score = candidate?.pulse_score ?? 0;
  const currentStreakCount = streak?.current_streak ?? 0;
  const firstName = 'Candidate';

  // Create artificial feed from views and matches
  const recentViews = views?.recent ?? [];
  const feedItems = [
    ...recentViews.map((v, i) => ({
      id: `view-${i}`,
      type: 'view',
      title: 'A recruiter viewed your profile',
      time: v.viewed_at ? new Date(v.viewed_at).toLocaleDateString() : 'Recent',
    })),
    ...(matches ?? []).map((m, i) => ({
      id: `match-${i}`,
      type: 'match',
      title: `New match: Frontend Role (${m.match_score}% match)`,
      time: m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent',
    }))
  ];
  
  if (feedItems.length === 0) {
    feedItems.push({
      id: 'welcome',
      type: 'system',
      title: 'Welcome to Pulse! Your profile is live.',
      time: 'Today',
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
      <Header title="Career Cockpit" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good morning, {firstName}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ready to advance your career today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl font-bold">
              <Flame className="w-5 h-5 fill-current" />
              {currentStreakCount} Day Streak
            </div>
            <Link 
              href="/candidate/profile"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              View profile
            </Link>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Pulse Score Card */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pl-2">
                <div className="relative flex-shrink-0 w-40 h-40 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" className="fill-none stroke-slate-100 dark:stroke-slate-700" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" className="fill-none stroke-indigo-600" strokeWidth="12" strokeLinecap="round" strokeDasharray="439.8" strokeDashoffset={`${439.8 - (439.8 * score) / 100}`} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                  </svg>
                  <div className="text-center z-10">
                    <span className="block text-4xl font-black text-slate-900 dark:text-white tracking-tight">{score}</span>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Pulse Score</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Score Breakdown</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Activity</span>
                      </div>
                      {candidate?.github_verified ? (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+20 pts</span>
                      ) : (
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Fix this</button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">LeetCode Rating</span>
                      </div>
                      {candidate?.leetcode_verified ? (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+15 pts</span>
                      ) : (
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Fix this</button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Video Pitch</span>
                      </div>
                      {candidate?.has_video_pitch ? (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+10 pts</span>
                      ) : (
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Fix this</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Opportunity Radar Card */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opportunity Radar</h3>
                    <p className="text-sm text-slate-500">{matches.length} new matches this week</p>
                  </div>
                </div>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">
                    Your first match is coming.{"\n"}Keep improving your Pulse Score.
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {matches.map((match) => (
                    <div key={match.id} className="min-w-[280px] border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full">{match.match_score}% Match</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">Senior Software Engineer</h4>
                      <p className="text-sm text-slate-500 mt-1">SaaS Startup in Bangalore</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {match.matched_skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] uppercase tracking-wider font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Recent Activity Feed */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Timeline</h3>
              <div className="space-y-6 pl-2 relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700 z-0"></div>
                {feedItems.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="relative z-10 flex gap-4 mt-4 first:mt-0">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm">
                      {item.type === 'match' && <Target className="w-3 h-3 text-blue-500" />}
                      {item.type === 'view' && <Eye className="w-3 h-3 text-purple-500" />}
                      {item.type === 'system' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Daily Challenge Card */}
            <section className={`bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-md text-white relative overflow-hidden transition-all duration-500 ${celebrating ? 'scale-105 shadow-2xl ring-4 ring-indigo-400' : ''}`}>
              <Sparkles className={`absolute right-[-10%] top-[-10%] w-32 h-32 text-white/10 rotate-12 pointer-events-none transition-transform duration-1000 ${celebrating ? 'scale-150 rotate-45' : ''}`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Daily Challenge</h3>
                  <Link href="/candidate/streak" className="bg-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm hover:bg-white/30 transition-colors">
                    Day {currentStreakCount + 1}
                  </Link>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-5">
                  <p className="font-medium text-[15px]">{challenge?.challenge_data?.title || 'Solve 1 LeetCode problem'}</p>
                  <p className="text-indigo-100 text-sm mt-1">Complete this to maintain your streak.</p>
                </div>
                
                {challengeCompleted ? (
                   <div className="w-full py-3 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Challenge Completed
                   </div>
                ) : (
                  <button onClick={handleCompleteChallenge} className="w-full py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                    Mark complete
                  </button>
                )}

                {celebrating && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></div>
                    <Sparkles className="w-12 h-12 text-white animate-bounce" />
                  </div>
                )}
              </div>
            </section>

            {/* 2. AI Copilot Suggestions Card */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pulse Copilot</h3>
              </div>
              
              {suggestions.length === 0 ? (
                <p className="text-sm text-slate-500">No new suggestions at the moment. You're doing great!</p>
              ) : (
                <div className="space-y-4">
                  {suggestions.slice(0, 3).map(s => {
                    const tipText = (s.suggestion as any)?.tip || "Add more skills to improve discoverability.";
                    return (
                      <div key={s.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 relative group">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-4">{tipText}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => handleSuggestionAction(s.id, 'accepted')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">Do it</button>
                          <button onClick={() => handleSuggestionAction(s.id, 'dismissed')} className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:bg-slate-200 rounded-lg transition-colors">Dismiss</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. Quick Stats */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400" /> Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Profile views (7d)</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{views.total_views}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Search appearances</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">14</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Rank Percentile</span>
                  <span className="text-lg font-bold text-indigo-600">Top 15%</span>
                </div>
              </div>
            </section>
            
          </div>
        </div>
      </main>
    </div>
  );
}
