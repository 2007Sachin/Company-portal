'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-card shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TipCardProps {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning';
  className?: string;
}

export function TipCard({ title, description, variant = 'info', className }: TipCardProps) {
  const variants = {
    info: 'bg-pulse-50 border-l-pulse-600',
    success: 'bg-green-50 border-l-green-600',
    warning: 'bg-amber-50 border-l-amber-600',
  };

  return (
    <div className={cn('rounded-card border-l-4 p-4', variants[variant], className)}>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

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
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-slate-500',
  };

  return (
    <Card className={cn('p-5', className)} hover>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium', changeColors[changeType])}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-card bg-pulse-50 flex items-center justify-center text-pulse-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
