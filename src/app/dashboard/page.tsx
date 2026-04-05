'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, MetricCard, ScoreRing, ProgressBar, TipCard } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';
import { GitCommit, GitMerge, CheckCircle, FileText, Trophy, TrendingUp, Briefcase, FileEdit, User } from 'lucide-react';

// Icon mapping for activity types
const activityIcons: Record<string, React.ReactNode> = {
  GitCommit: <GitCommit size={18} />,
  GitPullRequest: <GitCommit size={18} />,
  GitMerge: <GitMerge size={18} />,
  FolderPlus: <FileEdit size={18} />,
  Star: <TrendingUp size={18} />,
  CheckCircle: <CheckCircle size={18} />,
  Trophy: <Trophy size={18} />,
  FileText: <FileText size={18} />,
  Heart: <TrendingUp size={18} />,
  Circle: <CheckCircle size={18} />,
};

// Mock data
const mockProfile = {
  full_name: 'Sachin Kumar',
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

const mockNextSteps = [
  { id: '1', title: 'Complete your bio', description: 'Add a professional bio to increase profile views', action: 'Update profile', icon: <FileEdit size={18} className="text-pink-500" />, iconBg: 'bg-pink-50' },
  { id: '2', title: 'Add portfolio link', description: 'Showcase your best work with a portfolio URL', action: 'Add link', icon: <Briefcase size={18} className="text-green-500" />, iconBg: 'bg-green-50' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Nav */}
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Settings</Button>
            <Avatar src={null} name={mockProfile.full_name} size="sm" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header - Pathwisse style */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">{getGreeting()}</p>
            <h1 className="text-3xl font-bold text-slate-800">
              {mockProfile.full_name.split(' ')[0]}
            </h1>
            <p className="text-slate-500">Your career growth at a glance.</p>
          </div>
          <Link href="/profile/public">
            <Button variant="secondary" size="sm">
              View public profile
            </Button>
          </Link>
        </div>

        {/* Career Goal Card - Pathwisse style */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-card bg-slate-100 flex items-center justify-center text-pulse-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pulse Score</p>
                <p className="text-lg font-bold text-slate-800">Full Stack Developer Track</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pulse-600">{mockPulseScore.overall}%</p>
              <p className="text-xs text-slate-500">Overall Progress</p>
            </div>
          </div>
        </Card>

        {/* Metrics Row - Pathwisse style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Mastery"
            value={`${mockPulseScore.velocity}%`}
            change="4/12 stages"
            changeType="neutral"
            icon={<TrendingUp size={20} />}
          />
          <MetricCard
            label="Roadmap Progress"
            value={`${mockPulseScore.consistency}%`}
            change="+4 this week"
            changeType="positive"
            icon={<User size={20} />}
          />
          <MetricCard
            label="Milestones"
            value="8"
            change="Completed"
            changeType="positive"
            icon={<Trophy size={20} />}
          />
          <MetricCard
            label="Total Hours"
            value="15.2h"
            change="Personal best!"
            changeType="positive"
            icon={<FileEdit size={20} />}
          />
        </div>

        {/* Your Next Step - Pathwisse style */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Your Next Step</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockNextSteps.map((step) => (
              <Card key={step.id} className="p-5" hover>
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-card ${step.iconBg} flex items-center justify-center`}>
                    {step.icon}
                  </div>
                  {step.id === '1' && (
                    <span className="inline-flex px-2.5 py-0.5 rounded-chip text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      PRIORITY
                    </span>
                  )}
                  <div>
                    <p className="text-base font-bold text-slate-800">{step.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                  </div>
                  <Button size="sm" variant="primary">
                    {step.action}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Breakdown */}
          <Card className="p-6 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-800">Pulse Score</h3>
            <div className="flex flex-col items-center gap-4">
              <ScoreRing score={mockPulseScore.overall} size={160} strokeWidth={10} />
              <p className="text-xs text-slate-500">
                Trending up &middot; Top 25%
              </p>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Velocity" value={mockPulseScore.velocity} size="sm" color="bg-blue-500" />
              <ProgressBar label="Consistency" value={mockPulseScore.consistency} size="sm" color="bg-green-500" />
              <ProgressBar label="Breadth" value={mockPulseScore.breadth} size="sm" color="bg-purple-500" />
              <ProgressBar label="Impact" value={mockPulseScore.impact} size="sm" color="bg-amber-500" />
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-1">
              {mockActivity.map((activity) => {
                const iconName = getActivityIcon(activity.type);
                const icon = activityIcons[iconName] || <CheckCircle size={18} />;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 px-3 py-3 rounded-card hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex-shrink-0 text-slate-400">
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{activity.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{activity.platform}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatRelativeTime(activity.occurred_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Connected Platforms */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Connected platforms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'GitHub', username: 'sachinkumar', synced: '2 min ago', color: 'bg-slate-700' },
              { name: 'LeetCode', username: 'sachin_codes', synced: '1 hour ago', color: 'bg-amber-600' },
              { name: 'Medium', username: 'sachinwrites', synced: '3 hours ago', color: 'bg-green-600' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex items-center justify-between p-3 rounded-card bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-input ${platform.color} flex items-center justify-center text-white text-xs font-medium`}>
                    {platform.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{platform.name}</p>
                    <p className="text-xs text-slate-500">@{platform.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Synced
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
