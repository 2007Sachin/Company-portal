// src/lib/api.ts

/**
 * Global helper to resolve Nginx API calls safely appending Bearer tokens
 */
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('pulse_token');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status !== 409) {
      throw res;
    }
  }

  return res;
};

// ── Auth Service ──────────────────────────────
export const login = async (email: string, password: string) => {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async (email: string, password: string, role: string) => {
  return fetchAPI('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
};

export const logout = async () => {
  return fetchAPI('/api/auth/logout', { method: 'POST' });
};

// ── JD Parser Service ───────────────────────
export const parseJD = async (text: string) => {
  return fetchAPI('/api/jd/parse', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

// ── Candidate Service ───────────────────────
export const getCandidates = async (filters: URLSearchParams) => {
  return fetchAPI(`/api/candidates?${filters.toString()}`);
};

export const getCandidate = async (id: string) => {
  return fetchAPI(`/api/candidates/${id}`);
};

export const getCandidateScore = async (id: string) => {
  return fetchAPI(`/api/candidates/${id}/score`);
};

export const createCandidate = async (data: {
  headline: string;
  location: string;
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
}) => {
  return fetchAPI('/api/candidates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ── Candidate Me (Dashboard) ─────────────────
export const getCandidateMe = async () => {
  return fetchAPI('/api/candidates/me');
};

export const getCandidateDashboard = async () => {
  return fetchAPI('/api/candidates/me/dashboard');
};

export const getCandidateViews = async () => {
  return fetchAPI('/api/candidates/me/views');
};

export const getCandidateMatches = async () => {
  return fetchAPI('/api/candidates/me/matches');
};

export const getCandidateStreak = async () => {
  return fetchAPI('/api/candidates/me/streak');
};

export const getTodayChallenge = async () => {
  return fetchAPI('/api/candidates/me/challenge/today');
};

export const completeChallenge = async (challenge_id: string) => {
  return fetchAPI('/api/candidates/me/challenges/complete', {
    method: 'POST',
    body: JSON.stringify({ challenge_id }),
  });
};

export const getCandidateChallenges = async () => {
  return fetchAPI('/api/candidates/me/challenges');
};

export const getAgentSuggestions = async () => {
  return fetchAPI('/api/candidates/me/suggestions');
};

export const updateSuggestionStatus = async (id: string, status: 'accepted' | 'dismissed') => {
  return fetchAPI(`/api/candidates/me/suggestions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const updateCandidateMe = async (data: Partial<{
  full_name: string;
  headline: string;
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
  location: string;
  onboarding_step: number;
}>) => {
  return fetchAPI('/api/candidates/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateCandidateGoals = async (data: {
  target_roles: string[];
  target_locations: string[];
  comp_min?: number;
  comp_max?: number;
  comp_currency?: string;
  notice_period_days?: number;
  what_learning: string[];
}) => {
  return fetchAPI('/api/candidates/me/goals', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const scanGithub = async (username: string) => {
  return fetchAPI('/api/candidates/me/github/scan', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
};

export const getUploadUrl = async (bucket: string, fileName: string, contentType?: string) => {
  return fetchAPI('/api/candidates/me/storage/sign', {
    method: 'POST',
    body: JSON.stringify({ bucket, file_name: fileName, content_type: contentType }),
  });
};

// ── Copilot Service ─────────────────────────
export const copilotOptimizeProfile = async (data: {
  headline: string;
  skills: string[];
  experience_years: number;
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
}) => {
  return fetchAPI('/api/copilot/optimize-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const copilotScoreCoach = async (candidateData: any) => {
  return fetchAPI('/api/copilot/score-coach', {
    method: 'POST',
    body: JSON.stringify(candidateData),
  });
};

export const copilotMockInterview = async (data: {
  skills: string[];
  role_title?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}) => {
  return fetchAPI('/api/copilot/mock-interview', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ── Pipeline Service ────────────────────────
export const getPipeline = async () => {
  return fetchAPI('/api/pipeline');
};

export const addToPipeline = async (candidate_id: string, stage: 'saved' | 'shortlisted' | 'pending') => {
  return fetchAPI('/api/pipeline/add', {
    method: 'POST',
    body: JSON.stringify({ candidate_id, stage }),
  });
};

export const movePipelineStage = async (id: string, stage: 'saved' | 'shortlisted' | 'pending') => {
  return fetchAPI(`/api/pipeline/${id}/move`, {
    method: 'PUT',
    body: JSON.stringify({ stage }),
  });
};

export const removeFromPipeline = async (id: string) => {
  return fetchAPI(`/api/pipeline/${id}`, {
    method: 'DELETE',
  });
};

// ── Proof Builder Endpoints ─────────────────

export const getMyGithubRepos = async () => {
  return fetchAPI('/api/candidates/me/github-repos');
};

export const updateGithubRepo = async (id: string, data: { is_featured?: boolean; ai_generated_readme?: string }) => {
  return fetchAPI(`/api/candidates/me/github-repos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getMyCaseStudies = async () => {
  return fetchAPI('/api/candidates/me/case-studies');
};

export const createCaseStudy = async (data: any) => {
  return fetchAPI('/api/candidates/me/case-studies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteCaseStudy = async (id: string) => {
  return fetchAPI(`/api/candidates/me/case-studies/${id}`, {
    method: 'DELETE',
  });
};

export const getMyMockInterviews = async () => {
  return fetchAPI('/api/candidates/me/mock-interviews');
};

export const generateInterviewShareToken = async (id: string) => {
  return fetchAPI(`/api/candidates/me/mock-interviews/${id}/share`, {
    method: 'PUT',
  });
};

export const getMySkillAssessments = async () => {
  return fetchAPI('/api/candidates/me/skill-assessments');
};

export const submitSkillAssessment = async (data: any) => {
  return fetchAPI('/api/candidates/me/skill-assessments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getMyVideoPitch = async () => {
  return fetchAPI('/api/candidates/me/video-pitch');
};

export const upsertVideoPitch = async (data: any) => {
  return fetchAPI('/api/candidates/me/video-pitch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ── Copilot Proof Tools ──────────────────────

export const copilotGenerateReadme = async (repo_url: string) => {
  return fetchAPI('/api/copilot/generate-readme', {
    method: 'POST',
    body: JSON.stringify({ repo_url }),
  });
};

export const copilotStructureCaseStudy = async (data: { title: string; description: string; file_text_extract?: string }) => {
  return fetchAPI('/api/copilot/structure-case-study', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const copilotStartAssessment = async (skill: string) => {
  return fetchAPI('/api/copilot/assessment/start', {
    method: 'POST',
    body: JSON.stringify({ skill }),
  });
};

export const copilotGradeAssessment = async (skill: string, answers: Record<string, string>) => {
  return fetchAPI('/api/copilot/assessment/grade', {
    method: 'POST',
    body: JSON.stringify({ skill, answers }),
  });
};

export const copilotTranscribeVideo = async (video_url: string) => {
  return fetchAPI('/api/copilot/transcribe', {
    method: 'POST',
    body: JSON.stringify({ video_url }),
  });
};

// ── Opportunity Endpoints ───────────────────

export const getMyMatches = async (saved: boolean = false) => {
  return fetchAPI(`/api/candidates/me/matches?saved=${saved}`);
};

export const saveMatch = async (id: string, saved: boolean) => {
  return fetchAPI(`/api/candidates/me/matches/${id}/save`, {
    method: 'PUT',
    body: JSON.stringify({ saved }),
  });
};

export const dismissMatch = async (id: string) => {
  return fetchAPI(`/api/candidates/me/matches/${id}/dismiss`, {
    method: 'PUT',
  });
};

export const recomputeOpportunities = async () => {
  return fetchAPI('/api/candidates/me/opportunities/recompute', {
    method: 'POST',
  });
};

export const expressInterest = async (data: { jd_id: string; message: string }) => {
  return fetchAPI('/api/candidates/me/interests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getMyInterests = async (status: string = 'all') => {
  return fetchAPI(`/api/candidates/me/interests?status=${status}`);
};

export const respondToInterest = async (id: string, status: 'accepted' | 'declined') => {
  return fetchAPI(`/api/candidates/me/interests/${id}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const getRecruiterRequests = async () => {
  return fetchAPI('/api/recruiters/me/requests');
};

export const respondToCandidateRequest = async (id: string, status: 'accepted' | 'declined') => {
  return fetchAPI(`/api/recruiters/me/requests/${id}/respond`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

export const sendRecruiterSignal = async (data: {
  candidate_id: string;
  interest_type: 'viewed' | 'saved' | 'shortlisted' | 'unlock_requested';
  recruiter_message?: string;
  jd_id?: string;
}) => {
  return fetchAPI('/api/recruiters/me/signals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ── Opportunity Copilot ──────────────────────

export const copilotDraftIntro = async (data: {
  candidate_id: string;
  candidate_full_profile: any;
  parsed_jd: any;
  match_context: any;
}) => {
  return fetchAPI('/api/copilot/draft-intro', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
