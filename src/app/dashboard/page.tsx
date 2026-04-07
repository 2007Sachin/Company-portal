'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';
import { GitCommit, GitMerge, CheckCircle, FileText, Trophy, TrendingUp, FileEdit, User, Code, ArrowRight } from 'lucide-react';

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

const mockNextSteps = [
  { id: '1', title: 'Complete your bio', description: 'Add a professional bio to increase profile views', action: 'Update profile', actionUrl: '/onboarding/step-1' },
  { id: '2', title: 'Add portfolio link', description: 'Showcase your best work with a portfolio URL', action: 'Add link', actionUrl: '/onboarding/step-2' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-pulse-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-800">Pulse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding/step-1">
              <Button variant="ghost" size="sm">Edit profile</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
            <Avatar src={null} name={mockProfile.full_name} size="sm" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        
        {/* Section 0: Hero & Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Intro */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
              {getGreeting()},<br />
              <span className="text-pulse-600">{mockProfile.full_name.split(' ')[0]}</span>.
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              <strong className="text-slate-800">{mockProfile.professional_headline}</strong>.<br />
              Currently based in {mockProfile.location}. Replacing static resumes with live activity data. I combine problem-solving with code to build real impact.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
               <Link href="/profile/public">
                 <Button size="lg" className="w-full sm:w-auto">View public profile</Button>
               </Link>
               <Link href="/onboarding/step-1">
                 <Button variant="secondary" size="lg" className="w-full sm:w-auto">Update details</Button>
               </Link>
            </div>
          </div>

          {/* Right: 2x2 Bento Metrics */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
             <Card className="p-6 flex flex-col justify-center space-y-1 bg-slate-900 text-white border-0 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300"><TrendingUp size={64} /></div>
               <span className="text-4xl font-bold text-white relative z-10">{mockPulseScore.overall}</span>
               <p className="text-sm font-medium text-slate-300 relative z-10">Pulse Score</p>
             </Card>
             <Card className="p-6 flex flex-col justify-center space-y-1 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><User size={64} /></div>
               <span className="text-4xl font-bold text-slate-800 relative z-10">28</span>
               <p className="text-sm font-medium text-slate-500 relative z-10">Recruiter Views</p>
             </Card>
             <Card className="p-6 flex flex-col justify-center space-y-1 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><FileEdit size={64} /></div>
               <span className="text-4xl font-bold text-slate-800 relative z-10">85%</span>
               <p className="text-sm font-medium text-slate-500 relative z-10">Profile Complete</p>
             </Card>
             <Card className="p-6 flex flex-col justify-center space-y-1 bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
               <div className="absolute -top-2 -right-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><Trophy size={64} /></div>
               <span className="text-4xl font-bold text-slate-800 relative z-10">15d</span>
               <p className="text-sm font-medium text-slate-500 relative z-10">Activity Streak</p>
             </Card>
          </div>
        </section>

        {/* Section 1: Now (Recent Activity) */}
        <section className="space-y-8">
            <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-pulse-600 uppercase">/01 Now</p>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-800">What I&apos;m working on right now</h2>
                  <Link href="/profile/public" className="text-sm text-pulse-600 hover:text-pulse-700 font-medium">View all</Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {mockActivity.slice(0, 3).map((activity) => {
                 const iconName = getActivityIcon(activity.type);
                 const icon = activityIcons[iconName] || <CheckCircle size={18} />;
                 return (
                   <Card key={activity.id} className="p-6 space-y-6 hover:border-pulse-300 transition-colors flex flex-col justify-between">
                     <div className="space-y-5">
                       <span className="flex-shrink-0 text-pulse-600 bg-pulse-50 w-12 h-12 rounded-full flex items-center justify-center">
                         {icon}
                       </span>
                       <div className="space-y-2">
                         <h3 className="font-semibold text-slate-800 leading-snug">{activity.title}</h3>
                         <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs text-slate-600 capitalize">
                           {activity.platform}
                         </span>
                       </div>
                     </div>
                     <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                       <span>{formatRelativeTime(activity.occurred_at)}</span>
                       <Link href="/profile/public" className="hover:text-pulse-600 flex items-center gap-1 group">
                          Details <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                       </Link>
                     </div>
                   </Card>
                 );
               })}
            </div>
        </section>

        {/* Section 2: Platforms */}
        <section className="space-y-8">
            <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-pulse-600 uppercase">/02 Data Sources</p>
                <h2 className="text-2xl font-semibold text-slate-800">Connected Platforms</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'GitHub', username: 'rahulkumar', synced: '2 min ago', color: 'bg-slate-800' },
                { name: 'LeetCode', username: 'rahul_codes', synced: '1 hour ago', color: 'bg-amber-500' },
                { name: 'Medium', username: 'rahulwrites', synced: '3 hours ago', color: 'bg-emerald-600' },
              ].map((platform) => (
                <div key={platform.name} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${platform.color} shadow-sm`}>
                    <Code size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{platform.name}</h3>
                    <p className="text-xs text-slate-500">@{platform.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{platform.synced}</span>
                  </div>
                </div>
              ))}
            </div>
        </section>

        {/* Section 3: Next Steps Timeline */}
        <section className="space-y-8">
            <div className="space-y-1">
                <p className="text-xs font-bold tracking-wider text-pulse-600 uppercase">/03 Growth</p>
                <h2 className="text-2xl font-semibold text-slate-800">Action Plan</h2>
            </div>
            
            <div className="relative pl-6 sm:pl-0">
               {/* Vertical line for desktop/tablet */}
               <div className="hidden sm:block absolute left-[27px] top-8 bottom-8 w-px bg-slate-200" />
               
               <div className="space-y-8">
                 {mockNextSteps.map((step) => (
                   <div key={step.id} className="relative sm:flex sm:items-start gap-8 group">
                     {/* Node */}
                     <div className="hidden sm:flex flex-shrink-0 w-14 h-14 rounded-full bg-white border-4 border-slate-50 items-center justify-center relative z-10 shadow-sm group-hover:border-pulse-100 transition-colors">
                       <span className="w-3 h-3 rounded-full bg-pulse-600" />
                     </div>
                     
                     {/* Content */}
                     <Card className="flex-1 p-6 lg:p-8 hover:shadow-md transition-shadow border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-slate-800">{step.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                          </div>
                          <Link href={step.actionUrl} className="flex-shrink-0">
                            <Button variant="secondary" className="w-full sm:w-auto shadow-sm">{step.action}</Button>
                          </Link>
                        </div>
                     </Card>
                   </div>
                 ))}
               </div>
            </div>
        </section>

      </main>
    </div>
  );
}
