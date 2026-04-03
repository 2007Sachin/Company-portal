'use client';

import React, { useRef, useState } from 'react';
import { cn, generateGradientAvatar } from '@/lib/utils';

// --- Avatar ---
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-slate-700/50',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-slate-700/50',
        sizes[size],
        className
      )}
      style={{ background: generateGradientAvatar(name) }}
    >
      {initials}
    </div>
  );
}

// --- Avatar Upload ---
interface AvatarUploadProps {
  currentUrl?: string | null;
  name: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}

export function AvatarUpload({ currentUrl, name, onUpload, isUploading, className }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload(file);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <button
        type="button"
        onClick={handleClick}
        className="relative group"
        disabled={isUploading}
      >
        <Avatar
          src={preview || currentUrl}
          name={name || 'User'}
          size="xl"
          className="transition-all duration-300 group-hover:ring-pulse-500/50"
        />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUploading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>
      </button>
      <p className="text-xs text-slate-500">Click to upload photo</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
