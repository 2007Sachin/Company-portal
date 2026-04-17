'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, MetricCard, ScoreRing, ProgressBar } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { getActivityIcon, formatRelativeTime } from '@/lib/utils';
import {
  GitCommit, GitMerge, CheckCircle, FileText, Trophy,
  TrendingUp, FileEdit, Settings, Star, GitFork,
  ExternalLink, Play, Video, BookOpen, Code2,
} from 'lucide-react';

// ─────────────────────────────────────────────
//  MOCK DATA  (mirrors what step-2 collects)
// ─────────────────────────────────────────────

const mockProfile = {
  full_name: 'Sachin Kumar',
  professional_headline: 'Full Stack Developer | React & Node.js',
  avatar_url: null,
  location: 'Bangalore, India',
  college: 'IIT Bombay',
  github_username: 'sachinkumar',
};

const mockPulseScore = {
  overall: 72,
  velocity: 78,
  consistency: 65,
  breadth: 70,
  impact: 58,
};

const mockGitHubStats = [
  { label: 'Repositories', value: '42', icon: '📦' },
  { label: 'Commits (1y)', value: '1,247', icon: '🔥' },
  { label: 'PRs Merged', value: '86', icon: '✅' },
  { label: 'Languages', value: '7', icon: '💻' },
];

const mockRepos = [
  {
    name: 'pulse-platform',
    description: 'Full-stack recruitment intelligence platform built with Next.js, Express, and PostgreSQL',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 48,
    forks: 12,
    updatedAt: '2 days ago',
    url: 'https://github.com/sachinkumar/pulse-platform',
  },
  {
    name: 'react-kanban-board',
    description: 'Drag-and-drop Kanban board with real-time sync, built using React DnD and Firebase',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 132,
    forks: 34,
    updatedAt: '1 week ago',
    url: 'https://github.com/sachinkumar/react-kanban-board',
  },
  {
    name: 'ml-sentiment-api',
    description: 'REST API for sentiment analysis using Python, FastAPI, and a fine-tuned BERT model',
    language: 'Python',
    langColor: '#3572A5',
    stars: 87,
    forks: 21,
    updatedAt: '3 weeks ago',
    url: 'https://github.com/sachinkumar/ml-sentiment-api',
  },
  {
    name: 'devtools-cli',
    description: 'Productivity CLI for scaffolding microservices with built-in Docker and CI/CD templates',
    language: 'Go',
    langColor: '#00ADD8',
    stars: 64,
    forks: 8,
    updatedAt: '1 month ago',
    url: 'https://github.com/sachinkumar/devtools-cli',
  },
];

const mockLanguages = [
  { name: 'TypeScript', pct: 42, color: '#3178c6' },
  { name: 'Python', pct: 22, color: '#3572A5' },
  { name: 'JavaScript', pct: 15, color: '#f1e05a' },
  { name: 'Go', pct: 12, color: '#00ADD8' },
  { name: 'HTML', pct: 5, color: '#e34c26' },
  { name: 'Other', pct: 4, color: '#94a3b8' },
];

const mockProjects = [
  {
    id: '1',
    title: 'Pulse Recruitment Platform',
    description:
      'Built a full-stack activity-as-pedigree recruitment tool used by 200+ developers in beta. Designed the Pulse Score algorithm that aggregates GitHub, LeetCode, and Medium signals into a single hiring signal. Reduced recruiter screening time by 40% in early pilots.',
    techStack: 'Next.js · Node.js · PostgreSQL · Supabase · Tailwind CSS',
    liveUrl: 'https://pulse.app',
    repoUrl: 'https://github.com/sachinkumar/pulse-platform',
  },
  {
    id: '2',
    title: 'Real-time Kanban Board',
    description:
      'Developed an enterprise Kanban board with drag-and-drop, real-time collaboration via WebSockets, and offline support using service workers. Handles 10K concurrent users on a single instance thanks to connection pooling and event-driven architecture.',
    techStack: 'React · Firebase · React DnD · TypeScript · Tailwind CSS',
    liveUrl: 'https://kanban-demo.sachinkumar.dev',
    repoUrl: 'https://github.com/sachinkumar/react-kanban-board',
  },
  {
    id: '3',
    title: 'ML Sentiment Analysis API',
    description:
      'Fine-tuned a BERT model on a 50K sample customer review dataset, achieving 94% F1 score. Wrapped in a FastAPI service with Redis caching, serving 5K+ requests/day for a SaaS client. Deployed on GCP with auto-scaling.',
    techStack: 'Python · FastAPI · HuggingFace · Redis · Docker · GCP',
    liveUrl: '',
    repoUrl: 'https://github.com/sachinkumar/ml-sentiment-api',
  },
];

const mockActivity = [
  { id: '1', type: 'github_commit', title: 'feat: add user authentication flow', platform: 'github' as const, occurred_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'leetcode_solve', title: 'Solved: Two Sum II (Medium)', platform: 'leetcode' as const, occurred_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '3', type: 'github_pr_merged', title: 'PR #47: Implement dashboard analytics', platform: 'github' as const, occurred_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '4', type: 'medium_article', title: 'Understanding React Server Components', platform: 'medium' as const, occurred_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '5', type: 'leetcode_solve', title: 'Solved: Merge K Sorted Lists (Hard)', platform: 'leetcode' as const, occurred_at: new Date(Date.now() - 30 * 3600000).toISOString() },
];

const activityIcons: Record<string, React.ReactNode> = {
  GitCommit: <GitCommit size={16} />,
  GitPullRequest: <GitCommit size={16} />,
  GitMerge: <GitMerge size={16} />,
  FolderPlus: <FileEdit size={16} />,
  Star: <TrendingUp size={16} />,
  CheckCircle: <CheckCircle size={16} />,
  Trophy: <Trophy size={16} />,
  FileText: <FileText size={16} />,
  Heart: <TrendingUp size={16} />,
  Circle: <CheckCircle size={16} />,
};

// ─────────────────────────────────────────────
//  CONTRIBUTION GRAPH
// ─────────────────────────────────────────────
const CONTRIBUTION_COLORS = [
  'bg-slate-100',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-700',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateContributions(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 52; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      const r = Math.random();
      if (r < 0.35) days.push(0);
      else if (r < 0.55) days.push(1);
      else if (r < 0.75) days.push(2);
      else if (r < 0.9) days.push(3);
      else days.push(4);
    }
    weeks.push(days);
  }
  return weeks;
}

function ContributionGraph({ data }: { data: number[][] }) {
  const total = useMemo(() => data.flat().reduce((s, v) => s + v, 0), [data]);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{total.toLocaleString()} contributions in the last year</p>
        <a
          href={`https://github.com/${mockProfile.github_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          <div className="flex mb-1 ml-8">
            {MONTH_LABELS.map((m, i) => (
              <span key={i} className="text-[10px] text-slate-400 font-medium" style={{ width: `${100 / 12}%` }}>{m}</span>
            ))}
          </div>
          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 pr-1.5 pt-0.5">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[13px] flex items-center">
                  <span className="text-[10px] text-slate-400 font-medium w-6 text-right">{label}</span>
                </div>
              ))}
            </div>
            {data.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((level, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-[13px] h-[13px] rounded-[3px] ${CONTRIBUTION_COLORS[level]} hover:ring-1 hover:ring-slate-400 cursor-pointer transition-colors`}
                    title={`${level} contribution${level !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 mr-1">Less</span>
            {CONTRIBUTION_COLORS.map((c, i) => (
              <div key={i} className={`w-[13px] h-[13px] rounded-[3px] ${c}`} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  REPO CARD
// ─────────────────────────────────────────────
function RepoCard({ repo }: { repo: typeof mockRepos[0] }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8.5V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          <h4 className="text-sm font-semibold text-blue-600 group-hover:underline truncate">{repo.name}</h4>
        </div>
        <span className="flex-shrink-0 text-[10px] font-medium text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 uppercase">Public</span>
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{repo.description}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.langColor }} />
          {repo.language}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" /> {repo.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" /> {repo.forks}
        </span>
        <span className="ml-auto">{repo.updatedAt}</span>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────
//  PROJECT CARD
// ─────────────────────────────────────────────
function ProjectCard({ project, index }: { project: typeof mockProjects[0]; index: number }) {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
  ];
  return (
    <Card className="overflow-hidden" hover>
      {/* Top accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradients[index % gradients.length]}`} />
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center flex-shrink-0`}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">{project.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Case Study · Project {index + 1}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg px-2.5 py-1 transition-colors bg-blue-50 hover:bg-blue-100"
              >
                <ExternalLink className="w-3 h-3" /> Live
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 transition-colors hover:bg-slate-50"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Repo
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {project.techStack.split(' · ').map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
//  VIDEO PITCH CARD
// ─────────────────────────────────────────────
function VideoPitchCard() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Video className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Intro Video</h3>
            <p className="text-xs text-slate-500">Your 90-second pitch to recruiters</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Video player mock */}
      <div
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video cursor-pointer group"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {/* Thumbnail gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-indigo-900/40" />

        {/* Fake waveform decoration */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-0.5 h-8 opacity-30">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="flex-1 bg-white rounded-full"
              style={{ height: `${20 + Math.sin(i * 0.4) * 15 + Math.random() * 25}%` }}
            />
          ))}
        </div>

        {/* Profile overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">
            SK
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{mockProfile.full_name}</p>
            <p className="text-[10px] text-white/70">{mockProfile.professional_headline.split(' | ')[0]}</p>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded">
          1:24
        </div>

        {/* Play / Pause button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <Play className="w-5 h-5 text-slate-800 ml-0.5" fill="#1e293b" />
            )}
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between bg-slate-50">
        <p className="text-xs text-slate-500">Viewed by <span className="font-semibold text-slate-700">14 recruiters</span> this week</p>
        <Link href="/settings" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Replace video →
        </Link>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const contributions = useMemo(() => generateContributions(), []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Top Nav ── */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-card bg-pulse-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-800">Pulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings size={16} className="mr-1.5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
            <Link href="/profile/public">
              <Avatar
                src={null}
                name={mockProfile.full_name}
                size="sm"
                className="cursor-pointer hover:ring-2 hover:ring-pulse-400 hover:ring-offset-1 transition-all"
              />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={null} name={mockProfile.full_name} size="lg" />
            <div>
              <p className="text-sm text-slate-500">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-slate-800">{mockProfile.full_name}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{mockProfile.professional_headline}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">{mockProfile.location}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">{mockProfile.college}</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Actively looking
                </span>
              </div>
            </div>
          </div>
          <Link href="/profile/public">
            <Button variant="secondary" size="sm">View public profile</Button>
          </Link>
        </div>

        {/* ── Pulse Score Banner ── */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={mockPulseScore.overall} size={64} strokeWidth={6} />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pulse Score</p>
                <p className="text-xl font-bold text-slate-800">Full Stack Developer</p>
                <p className="text-xs text-slate-500 mt-0.5">Trending up · Top 25% of all candidates</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Velocity', value: mockPulseScore.velocity, color: 'bg-blue-500' },
                { label: 'Consistency', value: mockPulseScore.consistency, color: 'bg-green-500' },
                { label: 'Breadth', value: mockPulseScore.breadth, color: 'bg-purple-500' },
                { label: 'Impact', value: mockPulseScore.impact, color: 'bg-amber-500' },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-lg font-bold text-slate-800">{m.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.label}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════
            GITHUB ACTIVITY
        ══════════════════════════════════════════ */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">GitHub Activity</h2>
                <p className="text-xs text-slate-500">@{mockProfile.github_username} · Synced 2 min ago</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mockGitHubStats.map((stat) => (
              <Card key={stat.label} className="p-4 text-center" hover>
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Contribution graph */}
          <Card className="p-5">
            <ContributionGraph data={contributions} />
          </Card>

          {/* Pinned repos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Pinned Repositories</h3>
              <a
                href={`https://github.com/${mockProfile.github_username}?tab=repositories`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                See all <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockRepos.map((repo) => (
                <RepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          </div>

          {/* Top languages */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Top Languages</h3>
            <div className="flex rounded-full h-3 overflow-hidden gap-px">
              {mockLanguages.map((lang) => (
                <div
                  key={lang.name}
                  style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
                  title={`${lang.name} ${lang.pct}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {mockLanguages.map((lang) => (
                <span key={lang.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                  {lang.name}
                  <span className="text-slate-400">{lang.pct}%</span>
                </span>
              ))}
            </div>
          </Card>
        </section>

        {/* ══════════════════════════════════════════
            INTRO VIDEO  +  RECENT ACTIVITY
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Intro Video */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Intro Video</h2>
            </div>
            <VideoPitchCard />
          </section>

          {/* Recent Activity */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
              </div>
              <Link href="/profile/public">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <Card className="divide-y divide-slate-50">
              {mockActivity.map((activity) => {
                const iconName = getActivityIcon(activity.type);
                const icon = activityIcons[iconName] || <CheckCircle size={16} />;
                const platformColors: Record<string, string> = {
                  github: 'bg-slate-100 text-slate-600',
                  leetcode: 'bg-amber-50 text-amber-600',
                  medium: 'bg-green-50 text-green-600',
                };
                return (
                  <div key={activity.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/80 transition-colors">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${platformColors[activity.platform] ?? 'bg-slate-100 text-slate-500'}`}>
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
            </Card>
          </section>
        </div>

        {/* ══════════════════════════════════════════
            PROJECTS & CASE STUDIES
        ══════════════════════════════════════════ */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-800">Projects & Case Studies</h2>
            </div>
            <Link href="/onboarding/step-2">
              <Button variant="ghost" size="sm">
                <FileEdit size={14} className="mr-1.5" /> Edit projects
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {mockProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CONNECTED PLATFORMS
        ══════════════════════════════════════════ */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Connected Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'GitHub', username: mockProfile.github_username, synced: '2 min ago', color: 'bg-slate-800' },
              { name: 'LeetCode', username: 'sachin_codes', synced: '1 hour ago', color: 'bg-amber-600' },
              { name: 'Medium', username: 'sachinwrites', synced: '3 hours ago', color: 'bg-green-600' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${platform.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {platform.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{platform.name}</p>
                    <p className="text-xs text-slate-400">@{platform.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Synced
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{platform.synced}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
