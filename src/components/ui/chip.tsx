'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ChipOption } from '@/types';

interface ChipProps {
  label: string;
  icon?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Chip({ label, icon, isActive, onClick, className, size = 'md' }: ChipProps) {
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip font-medium border',
        'transition-colors duration-150 cursor-pointer select-none',
        sizes[size],
        isActive
          ? 'bg-pulse-600 border-pulse-600 text-white'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
        className
      )}
    >
      {icon && <span className="text-sm leading-none">{icon}</span>}
      {label}
      {isActive && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-0.5">
          <path d="M11 4L5.5 9.5L3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

interface ChipGroupProps {
  label?: string;
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  hint?: string;
  className?: string;
  chipSize?: 'sm' | 'md';
}

export function ChipGroup({
  label,
  options,
  selected,
  onChange,
  maxSelections,
  hint,
  className,
  chipSize = 'md',
}: ChipGroupProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (!maxSelections || selected.length < maxSelections) {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">{label}</label>
          {maxSelections && (
            <span className="text-xs text-slate-500">
              {selected.length}/{maxSelections} selected
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            isActive={selected.includes(option.value)}
            onClick={() => handleToggle(option.value)}
            size={chipSize}
          />
        ))}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
