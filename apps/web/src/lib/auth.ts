/**
 * Pulse Auth API Client
 *
 * All auth operations go through the nginx gateway at /api/auth/*
 * which routes to the auth-service on port 3001.
 *
 * In development (without Docker), calls go directly to localhost:3001.
 */

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || '/api/auth';

interface AuthResponse {
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    role: 'recruiter' | 'candidate';
    created_at: string;
  };
}

interface AuthError {
  error: string;
}

// ── Token management ──────────────────────
const TOKEN_KEY = 'pulse_token';
const REFRESH_TOKEN_KEY = 'pulse_refresh_token';
const USER_KEY = 'pulse_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function storeSession(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── API helpers ───────────────────────────
async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${AUTH_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as AuthError).error || 'Request failed');
  }

  return data as T;
}

// ── Auth operations ───────────────────────

export async function login(email: string, password: string, role?: string): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });

  storeSession(data);
  return data;
}

export async function signup(
  email: string,
  password: string,
  role: 'recruiter' | 'candidate' = 'candidate'
): Promise<AuthResponse> {
  const data = await authFetch<AuthResponse>('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });

  if (data.token) {
    storeSession(data);
  }
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authFetch('/logout', { method: 'POST' });
  } catch {
    // Proceed with local cleanup even if server call fails
  } finally {
    clearSession();
  }
}

export async function getMe() {
  return authFetch<{ user: AuthResponse['user'] }>('/me');
}

export async function refreshToken(): Promise<AuthResponse> {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const data = await authFetch<AuthResponse>('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  });

  storeSession(data);
  return data;
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
