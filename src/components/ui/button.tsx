'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-pulse-600 text-white hover:bg-pulse-500 focus:ring-pulse-500 shadow-lg shadow-pulse-600/25 hover:shadow-xl hover:shadow-pulse-500/30 active:scale-[0.98]',
      secondary: 'bg-slate-700/80 text-slate-200 border border-slate-600/50 hover:bg-slate-600/80 hover:border-slate-500/50 focus:ring-slate-500',
      ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 focus:ring-slate-500',
      danger: 'bg-red-600/90 text-white hover:bg-red-500 focus:ring-red-500 shadow-lg shadow-red-600/25',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
      lg: 'px-6 py-3 text-base rounded-lg gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
