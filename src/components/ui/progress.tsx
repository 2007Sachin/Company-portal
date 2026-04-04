'use client';

import React from 'react';
import { cn, getScoreColor, getScoreLabel } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
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
          {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
          {showPercentage && <span className="text-xs font-semibold text-slate-700">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            color || 'bg-pulse-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  score: number;
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-semibold', getScoreColor(score), size >= 100 ? 'text-3xl' : 'text-xl')}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-slate-500 mt-0.5">{getScoreLabel(score)}</span>
        )}
      </div>
    </div>
  );
}

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
  const trendLabels = {
    rising: 'Trending up',
    stable: 'Holding steady',
    declining: 'Needs attention',
  };

  const subcategories = [
    { label: 'Velocity', value: velocity, color: 'bg-blue-500' },
    { label: 'Consistency', value: consistency, color: 'bg-green-500' },
    { label: 'Breadth', value: breadth, color: 'bg-purple-500' },
    { label: 'Impact', value: impact, color: 'bg-amber-500' },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-6">
        <ScoreRing score={overall} size={140} strokeWidth={10} />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-800">Pulse Score</h3>
          <p className="text-sm text-slate-500">{getScoreLabel(overall)} developer</p>
          {trend && (
            <p className="text-xs text-slate-500">{trendLabels[trend]}</p>
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
            color={cat.color}
          />
        ))}
      </div>
    </div>
  );
}
