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
