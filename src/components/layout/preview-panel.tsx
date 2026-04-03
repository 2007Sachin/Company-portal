'use client';

import React from 'react';
import { cn, calculateCompletionPercentage } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { ScoreRing } from '@/components/ui/progress';

interface ProfilePreviewPanelProps {
  profileData: Record<string, unknown>;
  className?: string;
}

export function ProfilePreviewPanel({ profileData, className }: ProfilePreviewPanelProps) {
  const completion = calculateCompletionPercentage(profileData);
  const name = (profileData.full_name as string) || 'Your Name';
  const headline = (profileData.professional_headline as string) || 'Your Professional Headline';
  const location = (profileData.location as string) || '';
  const college = (profileData.college as string) || '';
  const targetRoles = (profileData.target_roles as string[]) || [];
  const avatarUrl = profileData.avatar_url as string | undefined;

  return (
    <aside className={cn('w-80 border-l border-slate-700/50 bg-slate-900/60 backdrop-blur-xl overflow-y-auto scrollbar-thin', className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Preview</h3>
          <p className="text-xs text-slate-500">See how your profile looks to recruiters</p>
        </div>

        {/* Preview Card */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden">
          {/* Banner */}
          <div className="h-20 pulse-gradient relative">
            <div className="absolute -bottom-8 left-4">
              <Avatar
                src={avatarUrl}
                name={name}
                size="lg"
                className="ring-4 ring-slate-800"
              />
            </div>
          </div>

          {/* Info */}
          <div className="pt-10 px-4 pb-4 space-y-3">
            <div>
              <h4 className="text-base font-bold text-white">{name}</h4>
              <p className="text-xs text-slate-400">{headline}</p>
            </div>

            {(location || college) && (
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {location && (
                  <span className="flex items-center gap-1">📍 {location}</span>
                )}
                {college && (
                  <span className="flex items-center gap-1">🎓 {college}</span>
                )}
              </div>
            )}

            {targetRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {targetRoles.slice(0, 3).map((role) => (
                  <span key={role} className="px-2 py-0.5 text-xs rounded-full bg-pulse-500/10 text-pulse-300 border border-pulse-500/20">
                    {role}
                  </span>
                ))}
                {targetRoles.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-slate-500">+{targetRoles.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Score Preview */}
          <div className="border-t border-slate-700/30 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pulse Score</p>
                <p className="text-lg font-bold text-slate-300">--</p>
                <p className="text-xs text-slate-600">Connect platforms to calculate</p>
              </div>
              <ScoreRing score={0} size={56} strokeWidth={4} showLabel={false} />
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Profile Completeness</span>
            <span className="text-xs font-bold text-pulse-400">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pulse-600 to-pulse-400 transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-pulse-500/10 bg-pulse-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span className="text-xs font-semibold text-slate-300">Pro Tip</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Profiles with a professional photo get <span className="text-pulse-300 font-medium">3x more recruiter views</span>. Upload one to stand out!
          </p>
        </div>
      </div>
    </aside>
  );
}
