'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Button, TipCard, Input, Textarea } from '@/components/ui';
import {
  UploadCloud,
  Video,
  FileText,
  Plus,
  X,
  User,
  FolderKanban,
  BookOpenCheck,
  Check,
} from 'lucide-react';

/* ─── Platform Tile ────────────────────────────────────────────────── */

function PlatformTile({
  name,
  icon,
  connected,
  username,
  onConnect,
  color,
}: {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  username?: string;
  onConnect: () => void;
  color: string;
}) {
  return (
    <div
      className={`
        relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
        ${
          connected
            ? 'border-green-300 bg-green-50/50'
            : 'border-slate-200 bg-white hover:border-pulse-300 hover:shadow-sm'
        }
      `}
      onClick={!connected ? onConnect : undefined}
    >
      {connected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        {connected && username ? (
          <p className="text-xs text-green-600">@{username}</p>
        ) : (
          <p className="text-xs text-slate-400">Click to connect</p>
        )}
      </div>
    </div>
  );
}

/* ─── Upload Zone ──────────────────────────────────────────────────── */

function UploadZone({
  file,
  onFileChange,
  accept,
  hint,
  icon: Icon,
}: {
  file: File | null;
  onFileChange: (file: File) => void;
  accept: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`
        group flex items-center gap-4 w-full px-4 py-3 border-2 border-dashed rounded-xl
        cursor-pointer transition-all duration-200
        ${
          file
            ? 'border-pulse-300 bg-pulse-50/40'
            : 'border-slate-200 bg-slate-50/30 hover:border-pulse-400 hover:bg-pulse-50/30'
        }
      `}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          file
            ? 'bg-pulse-100 text-pulse-600'
            : 'bg-slate-100 text-slate-400 group-hover:bg-pulse-100 group-hover:text-pulse-500'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        {file ? (
          <p className="text-sm font-medium text-slate-700 truncate">
            {file.name}{' '}
            <span className="text-slate-400 font-normal">
              ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            <span className="font-medium text-pulse-600">Upload</span> — {hint}
          </p>
        )}
      </div>
      {file && (
        <span className="shrink-0 text-xs font-medium text-pulse-600 bg-pulse-100 px-2 py-0.5 rounded-full">
          ✓
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) onFileChange(e.target.files[0]);
        }}
      />
    </div>
  );
}

/* ─── Section Tile ─────────────────────────────────────────────────── */

function SectionTile({
  icon,
  iconGradient,
  title,
  subtitle,
  action,
  children,
  className,
}: {
  icon: React.ReactNode;
  iconGradient: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm ${className || ''}`}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${iconGradient}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── Entry Card ───────────────────────────────────────────────────── */

function EntryCard({
  total,
  onRemove,
  children,
}: {
  index: number;
  total: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative bg-slate-50/50 border border-slate-100 rounded-xl p-4 transition-all hover:border-slate-200">
      {total > 1 && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ─── Main Page ────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */

export default function OnboardingStep2() {
  const router = useRouter();

  const [platforms, setPlatforms] = useState({
    github: { connected: false, username: '' },
    leetcode: { connected: false, username: '' },
    medium: { connected: false, username: '' },
  });

  const [aboutInfo, setAboutInfo] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState([
    { name: '', link: '', description: '' },
  ]);
  const [githubProjects, setGithubProjects] = useState([
    { repoName: '', description: '' },
  ]);
  const [caseStudies, setCaseStudies] = useState([
    { title: '', description: '', file: null as File | null },
  ]);

  const connectedCount = Object.values(platforms).filter((p) => p.connected).length;

  return (
    <OnboardingShell currentStep={2} completedSteps={[1]} profileData={{}}>
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-pulse-600">Step 2 of 4</p>
          <h2 className="text-3xl font-semibold text-slate-800">
            Show what you&apos;ve built
          </h2>
          <p className="text-slate-500">
            Connect platforms and showcase your work so recruiters see the real you.
          </p>
        </div>

        {/* ── Platforms — 3 col row ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Connect Platforms
            </p>
            <p className="text-xs text-slate-400">{connectedCount}/3 connected</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <PlatformTile
              name="GitHub"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>}
              connected={platforms.github.connected}
              username={platforms.github.username}
              onConnect={() => setPlatforms((p) => ({ ...p, github: { connected: true, username: 'rahulkumar' } }))}
              color="bg-slate-800"
            />
            <PlatformTile
              name="LeetCode"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>}
              connected={platforms.leetcode.connected}
              username={platforms.leetcode.username}
              onConnect={() => setPlatforms((p) => ({ ...p, leetcode: { connected: true, username: 'rahul_codes' } }))}
              color="bg-amber-600"
            />
            <PlatformTile
              name="Medium"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>}
              connected={platforms.medium.connected}
              username={platforms.medium.username}
              onConnect={() => setPlatforms((p) => ({ ...p, medium: { connected: true, username: 'rahulwrites' } }))}
              color="bg-green-700"
            />
          </div>
        </div>

        {/* ── About You — full-width tile ─────────────────── */}
        <SectionTile
          icon={<User className="w-4 h-4" />}
          iconGradient="bg-gradient-to-br from-violet-500 to-purple-600"
          title="About You"
          subtitle="Personal intro & video pitch"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Textarea
              label="Tell us about yourself"
              placeholder="I'm a passionate engineer with 3+ years of experience building scalable web apps. I love working on distributed systems..."
              rows={4}
              value={aboutInfo}
              onChange={(e) => setAboutInfo(e.target.value)}
              hint="This will appear on your public profile"
            />
            <div className="flex flex-col justify-between gap-4">
              <div className="flex-1">
                <UploadZone
                  file={videoFile}
                  onFileChange={setVideoFile}
                  accept="video/*"
                  hint="MP4, WebM (MAX. 50MB)"
                  icon={Video}
                />
              </div>
              <p className="text-xs text-slate-400">
                A 60–90 second video pitch helps you stand out. Candidates with videos get 2× more recruiter views.
              </p>
            </div>
          </div>
        </SectionTile>

        {/* ── 3 tiles in a row ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Featured Projects */}
          <SectionTile
            icon={<FolderKanban className="w-4 h-4" />}
            iconGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            title="Featured Projects"
            subtitle="Highlight your best work"
            action={
              <button
                onClick={() => setFeaturedProjects([...featuredProjects, { name: '', link: '', description: '' }])}
                className="flex items-center gap-1 text-xs font-medium text-pulse-600 hover:text-pulse-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            }
          >
            <div className="space-y-3">
              {featuredProjects.map((project, i) => (
                <EntryCard
                  key={i}
                  index={i}
                  total={featuredProjects.length}
                  onRemove={() => setFeaturedProjects(featuredProjects.filter((_, idx) => idx !== i))}
                >
                  <div className="space-y-3">
                    <Input
                      label="Project Name"
                      placeholder="E-Commerce Dashboard"
                      value={project.name}
                      onChange={(e) => {
                        const u = [...featuredProjects];
                        u[i] = { ...u[i], name: e.target.value };
                        setFeaturedProjects(u);
                      }}
                    />
                    <Input
                      label="Link / URL"
                      placeholder="https://..."
                      value={project.link}
                      onChange={(e) => {
                        const u = [...featuredProjects];
                        u[i] = { ...u[i], link: e.target.value };
                        setFeaturedProjects(u);
                      }}
                    />
                    <Textarea
                      label="About"
                      placeholder="Role, tech stack, impact..."
                      rows={2}
                      value={project.description}
                      onChange={(e) => {
                        const u = [...featuredProjects];
                        u[i] = { ...u[i], description: e.target.value };
                        setFeaturedProjects(u);
                      }}
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          </SectionTile>

          {/* GitHub Projects */}
          <SectionTile
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>}
            iconGradient="bg-gradient-to-br from-slate-700 to-slate-900"
            title="GitHub Projects"
            subtitle="Context for your top repos"
            action={
              <button
                onClick={() => setGithubProjects([...githubProjects, { repoName: '', description: '' }])}
                className="flex items-center gap-1 text-xs font-medium text-pulse-600 hover:text-pulse-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            }
          >
            <div className="space-y-3">
              {githubProjects.map((project, i) => (
                <EntryCard
                  key={i}
                  index={i}
                  total={githubProjects.length}
                  onRemove={() => setGithubProjects(githubProjects.filter((_, idx) => idx !== i))}
                >
                  <div className="space-y-3">
                    <Input
                      label="Repository"
                      placeholder="user/repo-name"
                      value={project.repoName}
                      onChange={(e) => {
                        const u = [...githubProjects];
                        u[i] = { ...u[i], repoName: e.target.value };
                        setGithubProjects(u);
                      }}
                      leftIcon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      }
                    />
                    <Textarea
                      label="About"
                      placeholder="Why is it important? What does it solve?"
                      rows={2}
                      value={project.description}
                      onChange={(e) => {
                        const u = [...githubProjects];
                        u[i] = { ...u[i], description: e.target.value };
                        setGithubProjects(u);
                      }}
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          </SectionTile>

          {/* Case Studies */}
          <SectionTile
            icon={<BookOpenCheck className="w-4 h-4" />}
            iconGradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            title="Case Studies"
            subtitle="Deep-dive write-ups"
            action={
              <button
                onClick={() => setCaseStudies([...caseStudies, { title: '', description: '', file: null }])}
                className="flex items-center gap-1 text-xs font-medium text-pulse-600 hover:text-pulse-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            }
          >
            <div className="space-y-3">
              {caseStudies.map((study, i) => (
                <EntryCard
                  key={i}
                  index={i}
                  total={caseStudies.length}
                  onRemove={() => setCaseStudies(caseStudies.filter((_, idx) => idx !== i))}
                >
                  <div className="space-y-3">
                    <Input
                      label="Title"
                      placeholder="e.g. Scaling Auth for 1M Users"
                      value={study.title}
                      onChange={(e) => {
                        const u = [...caseStudies];
                        u[i] = { ...u[i], title: e.target.value };
                        setCaseStudies(u);
                      }}
                    />
                    <Textarea
                      label="Summary"
                      placeholder="Problem, approach, outcome..."
                      rows={2}
                      value={study.description}
                      onChange={(e) => {
                        const u = [...caseStudies];
                        u[i] = { ...u[i], description: e.target.value };
                        setCaseStudies(u);
                      }}
                    />
                    <UploadZone
                      file={study.file}
                      onFileChange={(file) => {
                        const u = [...caseStudies];
                        u[i] = { ...u[i], file };
                        setCaseStudies(u);
                      }}
                      accept=".pdf,.doc,.docx,.pptx"
                      hint="PDF, DOCX, PPTX (10MB)"
                      icon={FileText}
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          </SectionTile>
        </div>

        {/* ── Tip ──────────────────────────────────────────── */}
        <TipCard
          title="More connections, stronger signal"
          description="Developers with 2+ integrations have a 75% higher chance of being discovered by recruiters. GitHub alone boosts your score by 40%."
          variant="success"
        />

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-1')}>
            Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-3')} size="lg">
            Save &amp; continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
