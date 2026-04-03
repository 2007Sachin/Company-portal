'use client';

import React from 'react';
import { cn, getScoreColor, getScoreLabel } from '@/lib/utils';

// --- Progress Bar ---
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
          {showPercentage && <span className="text-xs font-semibold text-slate-300">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-700/50 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            color || 'bg-gradient-to-r from-pulse-600 to-pulse-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// --- Score Ring ---
interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, showLabel = true, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="pulse-score-ring">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(51 65 85 / 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Score circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold font-display', getScoreColor(score), size >= 100 ? 'text-3xl' : 'text-xl')}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-slate-400 mt-0.5">{getScoreLabel(score)}</span>
        )}
      </div>
    </div>
  );
}

// --- Pulse Score Display ---
interface PulseScoreProps {
  overall: number;
  velocity: number;
  consistency: number;
  breadth: number;
  impact: number;
  trend?: 'rising' | 'stable' | 'declining';
  className?: string;
}

export function PulseScoreDisplay({
  overall,
  velocity,
  consistency,
  breadth,
  impact,
  trend,
  className,
}: PulseScoreProps) {
  const trendIcons = {
    rising: '📈',
    stable: '➡️',
    declining: '📉',
  };

  const subcategories = [
    { label: 'Velocity', value: velocity, color: 'from-blue-500 to-blue-400' },
    { label: 'Consistency', value: consistency, color: 'from-emerald-500 to-emerald-400' },
    { label: 'Breadth', value: breadth, color: 'from-purple-500 to-purple-400' },
    { label: 'Impact', value: impact, color: 'from-amber-500 to-amber-400' },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-6">
        <ScoreRing score={overall} size={140} strokeWidth={10} />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Pulse Score</h3>
          <p className="text-sm text-slate-400">{getScoreLabel(overall)} developer</p>
          {trend && (
            <p className="text-xs text-slate-500">
              {trendIcons[trend]} Trend: {trend}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {subcategories.map((cat) => (
          <ProgressBar
            key={cat.label}
            label={cat.label}
            value={cat.value}
            size="sm"
            color={`bg-gradient-to-r ${cat.color}`}
          />
        ))}
      </div>
    </div>
  );
}
