import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Building';
  if (score >= 20) return 'Getting Started';
  return 'New';
}

export function calculateCompletionPercentage(profile: Record<string, unknown>): number {
  const fields = [
    'full_name', 'email', 'phone', 'avatar_url', 'professional_headline',
    'location', 'college', 'degree', 'branch', 'graduation_year',
  ];

  const arrayFields = ['target_roles', 'ideal_environment'];

  let completed = 0;
  const total = fields.length + arrayFields.length;

  for (const field of fields) {
    if (profile[field] && String(profile[field]).trim() !== '') completed++;
  }

  for (const field of arrayFields) {
    const arr = profile[field] as unknown[];
    if (arr && Array.isArray(arr) && arr.length > 0) completed++;
  }

  return Math.round((completed / total) * 100);
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    github_commit: 'GitCommit',
    github_pr: 'GitPullRequest',
    github_pr_merged: 'GitMerge',
    github_repo_created: 'FolderPlus',
    github_star_received: 'Star',
    leetcode_solve: 'CheckCircle',
    leetcode_contest: 'Trophy',
    medium_article: 'FileText',
    medium_clap: 'Heart',
  };
  return icons[type] || 'Circle';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    github: 'text-slate-700',
    leetcode: 'text-amber-600',
    medium: 'text-green-600',
  };
  return colors[platform] || 'text-slate-500';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateGradientAvatar(name: string): string {
  // Generate a consistent gradient based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 70%, 60%), hsl(${h2}, 70%, 50%))`;
}
