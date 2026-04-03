'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// --- Card ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:border-pulse-500/30 hover:shadow-lg hover:shadow-pulse-500/10',
        glow && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </div>
  );
}

// --- Tip Card ---
interface TipCardProps {
  icon?: string;
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning';
  className?: string;
}

export function TipCard({ icon = '💡', title, description, variant = 'info', className }: TipCardProps) {
  const variants = {
    info: 'border-pulse-500/20 bg-pulse-500/5',
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
  };

  const iconBgs = {
    info: 'bg-pulse-500/10',
    success: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
  };

  return (
    <div className={cn('rounded-xl border p-4', variants[variant], className)}>
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base', iconBgs[variant])}>
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// --- Metric Card ---
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, change, changeType = 'neutral', icon, className }: MetricCardProps) {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card className={cn('p-5', className)} hover>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium', changeColors[changeType])}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-pulse-500/10 flex items-center justify-center text-pulse-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
