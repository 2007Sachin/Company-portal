// ============================================================
// Project Pulse — Candidate App Type Definitions
// ============================================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// --- Profile ---
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  professional_headline?: string;
  bio?: string;
  location?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  target_roles: string[];
  ideal_environment: string[];
  company_size_preference?: string[];
  work_authorization?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  is_public: boolean;
  onboarding_step: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// --- Integrations ---
export type IntegrationPlatform = 'github' | 'leetcode' | 'medium';
export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface Integration {
  id: string;
  user_id: string;
  platform: IntegrationPlatform;
  platform_username: string;
  platform_user_id?: string;
  access_token?: string;
  refresh_token?: string;
  status: IntegrationStatus;
  last_synced_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// --- Pulse Score ---
export interface PulseScore {
  id: string;
  user_id: string;
  overall_score: number; // 0-100
  velocity_score: number; // 0-100 — how fast you're shipping
  consistency_score: number; // 0-100 — how regularly you code
  breadth_score: number; // 0-100 — language/tech diversity
  impact_score: number; // 0-100 — PRs, stars, contributions
  trend: 'rising' | 'stable' | 'declining';
  percentile: number; // rank among all users
  calculated_at: string;
  breakdown: PulseScoreBreakdown;
}

export interface PulseScoreBreakdown {
  github: {
    commits_30d: number;
    prs_merged_30d: number;
    repos_contributed: number;
    languages: string[];
    streak_days: number;
  };
  leetcode: {
    problems_solved: number;
    easy: number;
    medium: number;
    hard: number;
    contest_rating?: number;
    streak_days: number;
  };
  medium: {
    articles_published: number;
    total_claps: number;
    followers: number;
  };
}

// --- Activity Timeline ---
export type ActivityType =
  | 'github_commit'
  | 'github_pr'
  | 'github_pr_merged'
  | 'github_repo_created'
  | 'github_star_received'
  | 'leetcode_solve'
  | 'leetcode_contest'
  | 'medium_article'
  | 'medium_clap';

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  description?: string;
  url?: string;
  platform: IntegrationPlatform;
  metadata?: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

// --- Career Preferences ---
export interface CareerPreferences {
  id: string;
  user_id: string;
  target_roles: string[];
  preferred_locations: string[];
  remote_preference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  notice_period_days?: number;
  willing_to_relocate: boolean;
  preferred_company_sizes: string[];
  preferred_industries: string[];
  job_search_status: 'actively_looking' | 'open_to_offers' | 'not_looking';
  available_from?: string;
  created_at: string;
  updated_at: string;
}

// --- Privacy Settings ---
export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'recruiters_only' | 'private';
  show_pulse_score: boolean;
  show_activity_timeline: boolean;
  show_github_activity: boolean;
  show_leetcode_stats: boolean;
  show_medium_articles: boolean;
  allow_recruiter_contact: boolean;
  show_email: boolean;
  show_phone: boolean;
  data_retention_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

// --- Onboarding ---
export interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const ONBOARDING_STEPS: Omit<OnboardingStep, 'isCompleted' | 'isCurrent'>[] = [
  { id: 1, title: 'About You', subtitle: 'The basics', icon: '1' },
  { id: 2, title: 'Your Work', subtitle: 'Connect platforms', icon: '2' },
  { id: 3, title: 'Career Goals', subtitle: 'Where you\'re headed', icon: '3' },
  { id: 4, title: 'Privacy', subtitle: 'You\'re in control', icon: '4' },
  { id: 5, title: 'Launch', subtitle: 'Go live', icon: '5' },
];

// --- Dashboard ---
export interface DashboardData {
  profile: Profile;
  pulseScore: PulseScore | null;
  recentActivity: Activity[];
  integrations: Integration[];
  readinessScore: number;
  blockers: DashboardBlocker[];
  recruiterViews: number;
  profileCompleteness: number;
}

export interface DashboardBlocker {
  id: string;
  type: 'missing_integration' | 'incomplete_profile' | 'low_activity' | 'privacy_too_strict';
  title: string;
  description: string;
  action: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}

// --- UI Component Props ---
export interface ChipOption {
  label: string;
  value: string;
  icon?: string;
}

// --- Constants ---
export const TARGET_ROLES: ChipOption[] = [
  { label: 'Frontend Developer', value: 'frontend' },
  { label: 'Backend Developer', value: 'backend' },
  { label: 'Full Stack Developer', value: 'fullstack' },
  { label: 'Mobile Developer', value: 'mobile' },
  { label: 'ML Engineer', value: 'ml' },
  { label: 'Data Engineer', value: 'data' },
  { label: 'DevOps Engineer', value: 'devops' },
  { label: 'Cloud Engineer', value: 'cloud' },
  { label: 'Security Engineer', value: 'security' },
  { label: 'QA Engineer', value: 'qa' },
];

export const IDEAL_ENVIRONMENTS: ChipOption[] = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'onsite' },
  { label: 'Startup', value: 'startup' },
  { label: 'Enterprise', value: 'enterprise' },
  { label: 'Product Company', value: 'product' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Open Source', value: 'opensource' },
];

export const DEGREE_OPTIONS = [
  'B.Tech',
  'B.E.',
  'BCA',
  'B.Sc (CS/IT)',
  'M.Tech',
  'MCA',
  'M.Sc (CS/IT)',
  'PhD',
  'Other',
];

export const BRANCH_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Data Science',
  'Artificial Intelligence',
  'Software Engineering',
  'Cyber Security',
  'Other',
];
