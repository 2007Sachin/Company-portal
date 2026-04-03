'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingShell } from '@/components/layout';
import { Button, Card, TipCard } from '@/components/ui';

interface PlatformCardProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'connected' | 'disconnected';
  username?: string;
  stats?: { label: string; value: string }[];
  onConnect: () => void;
  onDisconnect?: () => void;
  color: string;
}

function PlatformCard({ name, icon, description, status, username, stats, onConnect, onDisconnect, color }: PlatformCardProps) {
  return (
    <Card className="p-5 transition-all duration-300" hover>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">{name}</h4>
            <p className="text-xs text-slate-400">{description}</p>
            {status === 'connected' && username && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected as @{username}
              </p>
            )}
          </div>
        </div>
        <div>
          {status === 'connected' ? (
            <button
              onClick={onDisconnect}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <Button onClick={onConnect} size="sm" variant="secondary">
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {status === 'connected' && stats && stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/30 grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState({
    github: { connected: false, username: '' },
    leetcode: { connected: false, username: '' },
    medium: { connected: false, username: '' },
  });

  const handleConnectGithub = () => {
    // TODO: Implement GitHub OAuth
    setPlatforms((prev) => ({
      ...prev,
      github: { connected: true, username: 'rahulkumar' },
    }));
  };

  const handleConnectLeetcode = () => {
    // TODO: Implement LeetCode verification
    setPlatforms((prev) => ({
      ...prev,
      leetcode: { connected: true, username: 'rahul_codes' },
    }));
  };

  const handleConnectMedium = () => {
    // TODO: Implement Medium RSS
    setPlatforms((prev) => ({
      ...prev,
      medium: { connected: true, username: 'rahulwrites' },
    }));
  };

  const connectedCount = Object.values(platforms).filter((p) => p.connected).length;
  const completedSteps = connectedCount > 0 ? [1] : [1];

  return (
    <OnboardingShell currentStep={2} completedSteps={completedSteps} profileData={{}}>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <span className="text-xs font-semibold text-pulse-400 uppercase tracking-wider">Step 2 of 5</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-white">Proof of Work</h2>
          <p className="text-slate-400 text-lg">
            This is the magic moment ✨ Connect your platforms and let your activity speak for itself.
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex -space-x-2">
            {[
              { connected: platforms.github.connected, color: 'bg-gray-600' },
              { connected: platforms.leetcode.connected, color: 'bg-amber-600' },
              { connected: platforms.medium.connected, color: 'bg-green-600' },
            ].map((p, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs ${
                  p.connected ? p.color : 'bg-slate-700'
                }`}
              >
                {p.connected ? '✓' : `${i + 1}`}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{connectedCount}/3 platforms connected</p>
            <p className="text-xs text-slate-500">Connect at least 1 to generate your Pulse Score</p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="space-y-4">
          <PlatformCard
            name="GitHub"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            }
            description="Import commits, PRs, repos, languages, and contribution activity"
            status={platforms.github.connected ? 'connected' : 'disconnected'}
            username={platforms.github.username}
            stats={platforms.github.connected ? [
              { label: 'Commits (30d)', value: '127' },
              { label: 'PRs merged', value: '8' },
              { label: 'Languages', value: '5' },
            ] : undefined}
            onConnect={handleConnectGithub}
            color="bg-gray-700"
          />

          <PlatformCard
            name="LeetCode"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
              </svg>
            }
            description="Track problems solved, contest rating, streaks, and difficulty breakdown"
            status={platforms.leetcode.connected ? 'connected' : 'disconnected'}
            username={platforms.leetcode.username}
            stats={platforms.leetcode.connected ? [
              { label: 'Problems', value: '284' },
              { label: 'Contest Rating', value: '1,680' },
              { label: 'Streak', value: '15d' },
            ] : undefined}
            onConnect={handleConnectLeetcode}
            color="bg-amber-700"
          />

          <PlatformCard
            name="Medium"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
            }
            description="Showcase your tech articles, claps received, and follower growth"
            status={platforms.medium.connected ? 'connected' : 'disconnected'}
            username={platforms.medium.username}
            stats={platforms.medium.connected ? [
              { label: 'Articles', value: '12' },
              { label: 'Total Claps', value: '2.4K' },
              { label: 'Followers', value: '156' },
            ] : undefined}
            onConnect={handleConnectMedium}
            color="bg-green-700"
          />
        </div>

        {/* Tip */}
        <TipCard
          icon="🚀"
          title="The more you connect, the stronger your Pulse"
          description="Developers with 2+ integrations have a 75% higher chance of being discovered by recruiters. GitHub alone boosts your score by 40%."
          variant="success"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <Button variant="ghost" onClick={() => router.push('/onboarding/step-1')}>
            ← Back
          </Button>
          <Button onClick={() => router.push('/onboarding/step-3')} size="lg">
            Next: Career Path
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
