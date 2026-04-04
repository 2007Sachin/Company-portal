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
  const headline = (profileData.professional_headline as string) || 'Your headline will appear here';
  const location = (profileData.location as string) || '';
  const college = (profileData.college as string) || '';
  const targetRoles = (profileData.target_roles as string[]) || [];
  const avatarUrl = profileData.avatar_url as string | undefined;

  return (
    <aside className={cn('w-80 border-l border-slate-200 bg-white overflow-y-auto scrollbar-thin', className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-800">Live preview</h3>
          <p className="text-xs text-slate-500">How recruiters will see your profile</p>
        </div>

        {/* Preview Card */}
        <div className="rounded-card shadow-card overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-pulse-600 relative">
            <div className="absolute -bottom-8 left-4">
              <Avatar
                src={avatarUrl}
                name={name}
                size="lg"
                className="ring-4 ring-white"
              />
            </div>
          </div>

          {/* Info */}
          <div className="pt-10 px-4 pb-4 space-y-3">
            <div>
              <h4 className="text-base font-semibold text-slate-800">{name}</h4>
              <p className="text-xs text-slate-500">{headline}</p>
            </div>

            {(location || college) && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                {location && <span>{location}</span>}
                {college && <span>{college}</span>}
              </div>
            )}

            {targetRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {targetRoles.slice(0, 3).map((role) => (
                  <span key={role} className="px-2 py-0.5 text-xs rounded-chip bg-pulse-50 text-pulse-700 border border-pulse-200">
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
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Pulse Score</p>
                <p className="text-lg font-semibold text-slate-400">--</p>
                <p className="text-xs text-slate-400">Connect platforms to calculate</p>
              </div>
              <ScoreRing score={0} size={56} strokeWidth={4} showLabel={false} />
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="rounded-card shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Profile completeness</span>
            <span className="text-xs font-semibold text-pulse-600">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-pulse-600 transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-card bg-pulse-50 border-l-4 border-l-pulse-600 p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-700">Quick tip</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Profiles with a professional photo get 3x more recruiter views. Upload one to stand out.
          </p>
        </div>
      </div>
    </aside>
  );
}
