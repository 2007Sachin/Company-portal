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
