'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, MetricCard, ScoreRing, ProgressBar, TipCard } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';

// Mock data
const mockProfile = {
  full_name: 'Rahul Kumar',
  professional_headline: 'Full Stack Developer | React & Node.js',
  avatar_url: null,
  location: 'Bangalore, India',
  college: 'XYZ Engineering College',
};

const mockPulseScore = {
  overall: 72,
  velocity: 78,
  consistency: 65,
  breadth: 70,
  impact: 58,
  trend: 'rising' as const,
};

const mockActivity = [
  { id: '1', type: 'github_commit', title: 'feat: add user authentication flow', platform: 'github' as const, occurred_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'leetcode_solve', title: 'Solved: Two Sum II (Medium)', platform: 'leetcode' as const, occurred_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '3', type: 'github_pr_merged', title: 'PR #47: Implement dashboard analytics', platform: 'github' as const, occurred_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '4', type: 'medium_article', title: 'Understanding React Server Components', platform: 'medium' as const, occurred_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '5', type: 'leetcode_solve', title: 'Solved: Merge K Sorted Lists (Hard)', platform: 'leetcode' as const, occurred_at: new Date(Date.now() - 30 * 3600000).toISOString() },
];

const mockBlockers = [
  { id: '1', title: 'Complete your bio', description: 'Add a professional bio to increase profile views', action: 'Add Bio', priority: 'medium' as const },
  { id: '2', title: 'Add portfolio link', description: 'Showcase your best work with a portfolio URL', action: 'Add Link', priority: 'low' as const },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Nav */}
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Settings</Button>
            <Avatar src={null} name={mockProfile.full_name} size="sm" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-display text-white">
              Welcome back, {mockProfile.full_name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400">Here&apos;s how your Pulse profile is performing</p>
          </div>
          <Link href="/profile/public">
            <Button variant="secondary" size="sm">
              View Public Profile
            </Button>
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Pulse Score"
            value={mockPulseScore.overall}
            change="+4 this week"
            changeType="positive"
            icon={<span className="text-lg">⚡</span>}
          />
          <MetricCard
            label="Recruiter Views"
            value="28"
            change="+12 this week"
            changeType="positive"
            icon={<span className="text-lg">👀</span>}
          />
          <MetricCard
            label="Profile Completeness"
            value="85%"
            change="3 fields remaining"
            changeType="neutral"
            icon={<span className="text-lg">📋</span>}
          />
          <MetricCard
            label="Activity Streak"
            value="15 days"
            change="Personal best!"
            changeType="positive"
            icon={<span className="text-lg">🔥</span>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Breakdown */}
          <Card className="p-6 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pulse Score</h3>
            <div className="flex flex-col items-center gap-4">
              <ScoreRing score={mockPulseScore.overall} size={160} strokeWidth={10} />
              <p className="text-xs text-slate-500 flex items-center gap-1">
                📈 Trending up · Top 25%
              </p>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Velocity" value={mockPulseScore.velocity} size="sm" color="bg-gradient-to-r from-blue-500 to-blue-400" />
              <ProgressBar label="Consistency" value={mockPulseScore.consistency} size="sm" color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <ProgressBar label="Breadth" value={mockPulseScore.breadth} size="sm" color="bg-gradient-to-r from-purple-500 to-purple-400" />
              <ProgressBar label="Impact" value={mockPulseScore.impact} size="sm" color="bg-gradient-to-r from-amber-500 to-amber-400" />
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-1">
              {mockActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{activity.platform}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {formatRelativeTime(activity.occurred_at)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Blockers & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blockers */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Suggested Actions</h3>
            {mockBlockers.map((blocker) => (
              <div
                key={blocker.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/20"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-200">{blocker.title}</p>
                  <p className="text-xs text-slate-500">{blocker.description}</p>
                </div>
                <Button size="sm" variant="secondary">{blocker.action}</Button>
              </div>
            ))}
          </Card>

          {/* Connected Platforms */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Connected Platforms</h3>
            {[
              { name: 'GitHub', username: 'rahulkumar', synced: '2 min ago', color: 'bg-gray-600' },
              { name: 'LeetCode', username: 'rahul_codes', synced: '1 hour ago', color: 'bg-amber-600' },
              { name: 'Medium', username: 'rahulwrites', synced: '3 hours ago', color: 'bg-green-600' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${platform.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {platform.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{platform.name}</p>
                    <p className="text-xs text-slate-500">@{platform.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Synced
                  </span>
                  <p className="text-xs text-slate-600">{platform.synced}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <TipCard
          icon="💡"
          title="Boost your score"
          description="Push commits to your GitHub projects, solve LeetCode problems, or publish a Medium article. Your Pulse Score updates in real-time!"
          variant="info"
        />
      </main>
    </div>
  );
}
