'use client';

import React from 'react';
import { Card, ScoreRing, ProgressBar, Button } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';
import { GitCommit, GitMerge, CheckCircle, FileText } from 'lucide-react';

const activityIcons: Record<string, React.ReactNode> = {
  GitCommit: <GitCommit size={18} />,
  GitMerge: <GitMerge size={18} />,
  CheckCircle: <CheckCircle size={18} />,
  FileText: <FileText size={18} />,
};

const profile = {
  full_name: 'Sachin Kumar',
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-input bg-pulse-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">Pulse</span>
          </div>
          <Button size="sm" variant="secondary">
            Create your profile
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-pulse-600 relative" />
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar src={null} name={profile.full_name} size="xl" className="ring-4 ring-white" />
              <div className="flex-1 pb-1 space-y-1">
                <h1 className="text-2xl font-bold text-slate-800">{profile.full_name}</h1>
                <p className="text-sm text-slate-500">{profile.professional_headline}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
                  <span>{profile.location}</span>
                  <span>{profile.degree}, {profile.branch} &middot; {profile.graduation_year}</span>
                  <span>{profile.college}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary">Contact</Button>
                <Button size="sm" variant="ghost">Share</Button>
              </div>
            </div>
            {profile.bio && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.target_roles.map((role) => (
                <span key={role} className="px-3 py-1 text-xs rounded-chip bg-slate-50 text-slate-700 border border-slate-200">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score */}
          <Card className="p-6 space-y-6">
            <h3 className="text-sm font-semibold text-slate-800">Pulse Score</h3>
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={score.overall} size={140} strokeWidth={10} />
              <p className="text-xs text-slate-500">Trending up &middot; Top {100 - score.percentile}%</p>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Velocity" value={score.velocity} size="sm" color="bg-blue-500" />
              <ProgressBar label="Consistency" value={score.consistency} size="sm" color="bg-green-500" />
              <ProgressBar label="Breadth" value={score.breadth} size="sm" color="bg-purple-500" />
              <ProgressBar label="Impact" value={score.impact} size="sm" color="bg-amber-500" />
            </div>
          </Card>

          {/* Activity + Languages */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Recent activity</h3>
              <div className="space-y-1">
                {activity.map((item) => {
                  const iconName = getActivityIcon(item.type);
                  const icon = activityIcons[iconName] || <CheckCircle size={18} />;
                  return (
                    <div key={item.id} className="flex items-center gap-4 px-3 py-3 rounded-card hover:bg-slate-50 transition-colors">
                      <span className="text-slate-400 flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.platform}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatRelativeTime(item.occurred_at)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Top languages</h3>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-24">{lang.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
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

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Commits (30d)', value: '127' },
                { label: 'PRs merged', value: '8' },
                { label: 'LeetCode solved', value: '284' },
                { label: 'Contest rating', value: '1,680' },
                { label: 'Articles', value: '12' },
                { label: 'Streak', value: '15d' },
              ].map((stat) => (
                <Card key={stat.label} className="p-4 text-center" hover>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center py-6 text-xs text-slate-500">
          Powered by <span className="text-pulse-600 font-semibold">Pulse</span> &middot; Activity-as-Pedigree
        </div>
      </main>
    </div>
  );
}
