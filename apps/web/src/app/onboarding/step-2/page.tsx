'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Button, Card, TipCard, Input } from '@/components/ui';

/* ─── Mock data: 52 weeks × 7 days of contribution intensities ─── */
function generateMockContributions(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 52; w++) {
    const days: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Weighted random: mostly 0s, some 1-4
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

const MOCK_REPOS = [
  {
    name: 'pulse-platform',
    description: 'Full-stack recruitment intelligence platform built with Next.js, Express, and PostgreSQL',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 48,
    forks: 12,
    updatedAt: '2 days ago',
  },
  {
    name: 'react-kanban-board',
    description: 'Drag-and-drop Kanban board with real-time sync, built using React DnD and Firebase',
    language: 'TypeScript',
    langColor: '#3178c6',
    stars: 132,
    forks: 34,
    updatedAt: '1 week ago',
  },
  {
    name: 'ml-sentiment-api',
    description: 'REST API for sentiment analysis using Python, FastAPI, and a fine-tuned BERT model',
    language: 'Python',
    langColor: '#3572A5',
    stars: 87,
    forks: 21,
    updatedAt: '3 weeks ago',
  },
  {
    name: 'devtools-cli',
    description: 'Productivity CLI for scaffolding microservices with built-in Docker and CI/CD templates',
    language: 'Go',
    langColor: '#00ADD8',
    stars: 64,
    forks: 8,
    updatedAt: '1 month ago',
  },
];

const CONTRIBUTION_COLORS = [
  'bg-slate-100',       // 0 – no contributions
  'bg-emerald-200',     // 1
  'bg-emerald-400',     // 2
  'bg-emerald-500',     // 3
  'bg-emerald-700',     // 4
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ─── Project / Case Study types ─── */
interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  techStack: string;
  liveUrl: string;
  repoUrl: string;
}

function makeEmptyProject(): ProjectEntry {
  return { id: crypto.randomUUID(), title: '', description: '', techStack: '', liveUrl: '', repoUrl: '' };
}

/* ═══════════════════════════════════════════════════════════════════
   CONTRIBUTION GRAPH
   ═══════════════════════════════════════════════════════════════════ */
function ContributionGraph({ data }: { data: number[][] }) {
  // Total contributions count
  const totalContributions = useMemo(
    () => data.flat().reduce((sum, v) => sum + v, 0),
    [data],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {totalContributions.toLocaleString()} contributions in the last year
        </p>
      </div>

      {/* Graph container with horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {MONTH_LABELS.map((m, i) => (
              <span key={i} className="text-[10px] text-slate-400 font-medium" style={{ width: `${100 / 12}%` }}>
                {m}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 pr-1.5 pt-0.5">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[13px] flex items-center">
                  <span className="text-[10px] text-slate-400 font-medium w-6 text-right">{label}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {data.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((level, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-[13px] h-[13px] rounded-[3px] ${CONTRIBUTION_COLORS[level]} transition-colors duration-150 hover:ring-1 hover:ring-slate-400 cursor-pointer`}
                    title={`${level} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
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

/* ═══════════════════════════════════════════════════════════════════
   REPO CARD
   ═══════════════════════════════════════════════════════════════════ */
function RepoCard({ repo }: { repo: typeof MOCK_REPOS[0] }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8.5V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          <h4 className="text-sm font-semibold text-blue-600 group-hover:underline truncate">{repo.name}</h4>
        </div>
        <span className="flex-shrink-0 text-[10px] font-medium text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 uppercase">
          Public
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{repo.description}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.langColor }} />
          {repo.language}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>
          {repo.stars}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
          {repo.forks}
        </span>
        <span className="ml-auto">{repo.updatedAt}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROJECT FORM CARD
   ═══════════════════════════════════════════════════════════════════ */
function ProjectFormCard({
  project,
  index,
  onUpdate,
  onRemove,
}: {
  project: ProjectEntry;
  index: number;
  onUpdate: (id: string, field: keyof ProjectEntry, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="p-5 space-y-4 relative group">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Project {index + 1}</h4>
        <button
          onClick={() => onRemove(project.id)}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          Remove
        </button>
      </div>

      <Input
        label="Project title"
        placeholder="e.g. Real-time Chat Application"
        value={project.title}
        onChange={(e) => onUpdate(project.id, 'title', e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description / Case Study</label>
        <textarea
          rows={3}
          placeholder="Describe what you built, the problem it solved, and your role. Include metrics if possible (e.g., handled 10K concurrent users)..."
          value={project.description}
          onChange={(e) => onUpdate(project.id, 'description', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
        />
      </div>
      <Input
        label="Tech stack"
        placeholder="React, Node.js, PostgreSQL, Docker..."
        value={project.techStack}
        onChange={(e) => onUpdate(project.id, 'techStack', e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Live URL (optional)"
          placeholder="https://myproject.com"
          value={project.liveUrl}
          onChange={(e) => onUpdate(project.id, 'liveUrl', e.target.value)}
        />
        <Input
          label="Repository URL (optional)"
          placeholder="https://github.com/user/repo"
          value={project.repoUrl}
          onChange={(e) => onUpdate(project.id, 'repoUrl', e.target.value)}
        />
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VIDEO PITCH UPLOADER
   ═══════════════════════════════════════════════════════════════════ */
function VideoPitchUploader({
  videoFile,
  videoPreviewUrl,
  onUpload,
  onRemove,
}: {
  videoFile: File | null;
  videoPreviewUrl: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        onUpload(file);
      }
    },
    [onUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Has video uploaded ──
  if (videoFile && videoPreviewUrl) {
    return (
      <div className="space-y-4">
        {/* Video player */}
        <div className="relative rounded-2xl overflow-hidden bg-black group cursor-pointer" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={videoPreviewUrl}
            className="w-full aspect-video object-contain"
            onEnded={() => setIsPlaying(false)}
          />
          {/* Play/Pause overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
              isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1e293b">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* File info bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{videoFile.name}</p>
              <p className="text-xs text-slate-400">{formatSize(videoFile.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              Replace
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  // ── Upload dropzone ──
  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-50/80 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
      >
        <div className="space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700">
              {isDragging ? 'Drop your video here' : 'Drag & drop your video, or click to browse'}
            </p>
            <p className="text-xs text-slate-400">
              MP4, MOV, or WebM &middot; Max 2 minutes &middot; Up to 100 MB
            </p>
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function OnboardingStep2() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [contributions] = useState(() => generateMockContributions());
  const [projects, setProjects] = useState<ProjectEntry[]>([makeEmptyProject()]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const handleConnectGithub = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise((r) => setTimeout(r, 1800));
    setGithubConnected(true);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    setGithubConnected(false);
  };

  const addProject = () => {
    setProjects((prev) => [...prev, makeEmptyProject()]);
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleVideoUpload = useCallback((file: File) => {
    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be under 100 MB');
      return;
    }
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleVideoRemove = useCallback(() => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  }, [videoPreviewUrl]);

  return (
    <OnboardingShell currentStep={2} completedSteps={[1]} profileData={{}}>
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">Step 2 of 5</p>
          <h2 className="text-3xl font-bold text-slate-800">Connect your GitHub</h2>
          <p className="text-slate-500 text-lg">
            Link your GitHub account so recruiters see your real coding activity — contributions, projects, and impact.
          </p>
        </div>

        {/* ─── GitHub Connect Section ─── */}
        {!githubConnected ? (
          <Card className="p-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Connect your GitHub account</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                We&apos;ll import your contribution history, repositories, and coding languages to build your Pulse profile.
                Your data is read-only — we never push code.
              </p>
            </div>
            <Button
              onClick={handleConnectGithub}
              size="lg"
              isLoading={isConnecting}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 px-8"
            >
              <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Connect with GitHub
            </Button>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Read-only access
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                DPDP compliant
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Takes 10 seconds
              </span>
            </div>
          </Card>
        ) : (
          /* ─── Connected State ─── */
          <div className="space-y-8">
            {/* Connected banner */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">GitHub Connected</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    @rahulkumar &middot; Last synced just now
                  </p>
                </div>
              </div>
              <button onClick={handleDisconnect} className="text-xs text-slate-400 hover:text-red-600 transition-colors font-medium">
                Disconnect
              </button>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Repositories', value: '42', icon: '📦' },
                { label: 'Commits (1y)', value: '1,247', icon: '🔥' },
                { label: 'PRs Merged', value: '86', icon: '✅' },
                { label: 'Languages', value: '7', icon: '💻' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Contribution graph */}
            <Card className="p-5">
              <ContributionGraph data={contributions} />
            </Card>

            {/* Pinned repositories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Pinned Repositories</h3>
                <span className="text-xs text-slate-400">Showing top 4 by activity</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_REPOS.map((repo) => (
                  <RepoCard key={repo.name} repo={repo} />
                ))}
              </div>
            </div>

            {/* Top languages */}
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Top Languages</h3>
              <div className="flex rounded-full h-3 overflow-hidden">
                <div className="bg-[#3178c6]" style={{ width: '42%' }} title="TypeScript 42%" />
                <div className="bg-[#3572A5]" style={{ width: '22%' }} title="Python 22%" />
                <div className="bg-[#f1e05a]" style={{ width: '15%' }} title="JavaScript 15%" />
                <div className="bg-[#00ADD8]" style={{ width: '12%' }} title="Go 12%" />
                <div className="bg-[#e34c26]" style={{ width: '5%' }} title="HTML 5%" />
                <div className="bg-slate-300" style={{ width: '4%' }} title="Other 4%" />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { name: 'TypeScript', pct: '42%', color: '#3178c6' },
                  { name: 'Python', pct: '22%', color: '#3572A5' },
                  { name: 'JavaScript', pct: '15%', color: '#f1e05a' },
                  { name: 'Go', pct: '12%', color: '#00ADD8' },
                  { name: 'HTML', pct: '5%', color: '#e34c26' },
                  { name: 'Other', pct: '4%', color: '#94a3b8' },
                ].map((lang) => (
                  <span key={lang.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name} <span className="text-slate-400">{lang.pct}</span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ─── Video Pitch ─── */}
        <Card className="p-6 space-y-5 overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">Video Pitch</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <p className="text-sm text-slate-500">
                A 60-90 second intro video helps recruiters put a face to your profile. Candidates with videos get 2x more interview requests.
              </p>
            </div>
          </div>

          <VideoPitchUploader
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            onUpload={handleVideoUpload}
            onRemove={handleVideoRemove}
          />

          {/* Tips — shown only when no video uploaded */}
          {!videoFile && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '🎯', title: 'Keep it focused', desc: '60-90 seconds is the sweet spot' },
                { icon: '💡', title: 'What to cover', desc: 'Who you are, what excites you, a standout project' },
                { icon: '🎥', title: 'Quick tips', desc: 'Good lighting, clear audio, look at the camera' },
              ].map((tip) => (
                <div key={tip.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-lg">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{tip.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ─── Projects & Case Studies ─── */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Projects &amp; Case Studies</h3>
            <p className="text-sm text-slate-500">
              Tell recruiters about the projects you&apos;re most proud of. Describe the problem, your approach, and the impact.
            </p>
          </div>

          {projects.map((project, i) => (
            <ProjectFormCard
              key={project.id}
              project={project}
              index={i}
              onUpdate={updateProject}
              onRemove={removeProject}
            />
          ))}

          <button
            onClick={addProject}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
          >
            + Add another project
          </button>
        </div>

        {/* Tip */}
        <TipCard
          title="Projects make you stand out"
          description="Candidates who showcase 2+ projects with detailed case studies are 3x more likely to be shortlisted by recruiters. Include metrics and outcomes for maximum impact."
          variant="success"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-1')}>
            Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-3')} size="lg">
            Save &amp; continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
