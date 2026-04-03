'use client';

import React from 'react';
import { Card, ScoreRing, ProgressBar, Button } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';

// Mock public profile data
const profile = {
  full_name: 'Rahul Kumar',
  professional_headline: 'Full Stack Developer | React & Node.js',
  avatar_url: null,
  location: 'Bangalore, India',
  college: 'XYZ Engineering College',
  degree: 'B.Tech',
  branch: 'Computer Science',
  graduation_year: 2025,
  target_roles: ['Full Stack Developer', 'Backend Developer', 'DevOps Engineer'],
  bio: 'Passionate full-stack developer with a focus on building scalable web applications. I love open source and believe in learning by building.',
};

const score = {
  overall: 72,
  velocity: 78,
  consistency: 65,
  breadth: 70,
  impact: 58,
  trend: 'rising' as const,
  percentile: 75,
};

const activity = [
  { id: '1', type: 'github_commit', title: 'feat: add user authentication flow', platform: 'github' as const, occurred_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'leetcode_solve', title: 'Solved: Two Sum II (Medium)', platform: 'leetcode' as const, occurred_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '3', type: 'github_pr_merged', title: 'PR #47: Implement dashboard analytics', platform: 'github' as const, occurred_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '4', type: 'medium_article', title: 'Understanding React Server Components', platform: 'medium' as const, occurred_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

const languages = [
  { name: 'TypeScript', percentage: 45, color: 'bg-blue-500' },
  { name: 'Python', percentage: 25, color: 'bg-yellow-500' },
  { name: 'Go', percentage: 15, color: 'bg-cyan-500' },
  { name: 'JavaScript', percentage: 10, color: 'bg-amber-500' },
  { name: 'CSS', percentage: 5, color: 'bg-pink-500' },
];

export default function PublicProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg pulse-gradient flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-sm font-bold font-display text-white">Pulse</span>
          </div>
          <Button size="sm" variant="secondary">
            Create Your Profile
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-36 pulse-gradient relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar src={null} name={profile.full_name} size="xl" className="ring-4 ring-slate-800" />
              <div className="flex-1 pb-1 space-y-1">
                <h1 className="text-2xl font-bold font-display text-white">{profile.full_name}</h1>
                <p className="text-sm text-slate-400">{profile.professional_headline}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
                  <span>📍 {profile.location}</span>
                  <span>🎓 {profile.degree}, {profile.branch} · {profile.graduation_year}</span>
                  <span>🏫 {profile.college}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary">Contact</Button>
                <Button size="sm" variant="ghost">Share</Button>
              </div>
            </div>
            {profile.bio && (
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.target_roles.map((role) => (
                <span key={role} className="px-3 py-1 text-xs rounded-full bg-pulse-500/10 text-pulse-300 border border-pulse-500/20">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score */}
          <Card className="p-6 space-y-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pulse Score</h3>
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={score.overall} size={140} strokeWidth={10} />
              <p className="text-xs text-slate-500">📈 Trending up · Top {100 - score.percentile}%</p>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Velocity" value={score.velocity} size="sm" color="bg-gradient-to-r from-blue-500 to-blue-400" />
              <ProgressBar label="Consistency" value={score.consistency} size="sm" color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <ProgressBar label="Breadth" value={score.breadth} size="sm" color="bg-gradient-to-r from-purple-500 to-purple-400" />
              <ProgressBar label="Impact" value={score.impact} size="sm" color="bg-gradient-to-r from-amber-500 to-amber-400" />
            </div>
          </Card>

          {/* Activity + Languages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Activity</h3>
              <div className="space-y-1">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800/30 transition-colors">
                    <span className="text-xl flex-shrink-0">{getActivityIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{item.platform}</p>
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">{formatRelativeTime(item.occurred_at)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Top Languages</h3>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 w-24">{lang.name}</span>
                    <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${lang.color} transition-all duration-700`}
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Commits (30d)', value: '127', icon: '📝' },
                { label: 'PRs Merged', value: '8', icon: '✅' },
                { label: 'LeetCode Solved', value: '284', icon: '🧩' },
                { label: 'Contest Rating', value: '1,680', icon: '🏆' },
                { label: 'Articles', value: '12', icon: '📰' },
                { label: 'Streak', value: '15d', icon: '🔥' },
              ].map((stat) => (
                <Card key={stat.label} className="p-4 text-center" hover>
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-slate-600">
          Powered by <span className="text-pulse-400 font-semibold">Pulse</span> · Activity-as-Pedigree
        </div>
      </main>
    </div>
  );
}
