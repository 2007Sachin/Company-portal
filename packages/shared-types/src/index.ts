export type Candidate = {
  id: string;
  full_name: string | null;
  headline: string;
  pulse_score: number; // 0-150
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
  location: string;
  onboarding_step: number;
  created_at: string;
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

// ── Full Candidate Experience Types ────────────────────────

export type CandidateGoals = {
  candidate_id: string;
  target_roles: string[];
  target_locations: string[];
  comp_min: number | null;
  comp_max: number | null;
  comp_currency: string;
  notice_period_days: number | null;
  what_learning: string[];
  updated_at: string;
}

export type GithubRepo = {
  id: string;
  candidate_id: string;
  repo_url: string;
  repo_name: string | null;
  is_featured: boolean;
  ai_generated_readme: string | null;
  inferred_skills: string[];
  commit_count_30d: number;
  stars: number;
  last_synced_at: string | null;
  created_at: string;
}

export type CaseStudy = {
  id: string;
  candidate_id: string;
  title: string;
  description: string | null;
  skills: string[];
  file_url: string | null;
  file_type: string | null;
  ai_structured_content: Record<string, any>;
  created_at: string;
}

export type VideoPitch = {
  id: string;
  candidate_id: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  created_at: string;
}

export type SkillAssessment = {
  id: string;
  candidate_id: string;
  skill: string;
  score: number;
  verified_by_ai: boolean;
  transcript: Record<string, any>;
  created_at: string;
}

export type MockInterview = {
  id: string;
  candidate_id: string;
  role_title: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  questions: any[];
  candidate_answers: any[];
  ai_feedback: Record<string, any>;
  overall_score: number | null;
  shareable_token: string | null;
  created_at: string;
}

export type ProofEvent = {
  id: string;
  candidate_id: string;
  event_type: 'github_commit' | 'leetcode_solved' | 'mock_interview_completed' | 'skill_assessment_passed' | 'case_study_added' | 'video_pitch_added' | 'readme_generated' | 'skill_added' | 'score_increased';
  event_data: Record<string, any>;
  score_impact: number;
  created_at: string;
}

export type RecruiterInterest = {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  interest_type: 'viewed' | 'saved' | 'shortlisted' | 'unlock_requested' | 'unlocked' | null;
  recruiter_message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  jd_id: string | null;
  created_at: string;
  responded_at: string | null;
}

export type CandidateIntroDraft = {
  id: string;
  candidate_id: string;
  jd_id: string | null;
  draft_text: string;
  sent: boolean;
  cache_key: string | null;
  created_at: string;
}

// Response Wrappers
export type GithubReposResponse = GithubRepo[];
export type CaseStudiesResponse = CaseStudy[];
export type SkillAssessmentsResponse = SkillAssessment[];
export type MockInterviewsResponse = MockInterview[];
export type ProofEventsResponse = ProofEvent[];
export type RecruiterInterestResponse = RecruiterInterest[];

export type GithubScanResponse = {
  repos: Partial<GithubRepo>[];
  inferred_skills: string[];
}

export type SignedUrlResponse = {
  signedUrl: string;
  path: string;
}
