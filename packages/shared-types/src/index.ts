export type Candidate = {
  id: string;
  headline: string;
  pulse_score: number;
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
  location: string;
}

export type ParsedJD = {
  role_title: string;
  skills: string[];
  experience_years: number;
  location: string;
}

export type PipelineCandidate = {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  stage: 'saved' | 'shortlisted' | 'pending';
  created_at: string;
}

export type User = {
  id: string;
  email: string;
  role: 'recruiter' | 'candidate';
  created_at: string;
}

// ── Candidate-Side Types ───────────────────────────────────

export type ProfileView = {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  viewed_at: string;
}

export type CandidateMatch = {
  id: string;
  candidate_id: string;
  jd_id: string | null;
  match_score: number;
  matched_skills: string[];
  created_at: string;
}

export type DailyChallenge = {
  id: string;
  candidate_id: string;
  challenge_type: string;
  challenge_data: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
}

export type CandidateStreak = {
  candidate_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export type AgentSuggestion = {
  id: string;
  candidate_id: string;
  agent_type: string;
  suggestion: Record<string, unknown>;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
}
