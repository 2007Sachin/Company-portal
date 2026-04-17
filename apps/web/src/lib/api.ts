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
  headline: string;
  experience_years: number;
  notice_period_days: number;
  skills: string[];
  github_verified: boolean;
  leetcode_verified: boolean;
  has_video_pitch: boolean;
  location: string;
}>) => {
  return fetchAPI('/api/candidates/me', {
    method: 'PUT',
    body: JSON.stringify(data),
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
