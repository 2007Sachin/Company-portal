-- ============================================================
-- 002_candidate_side.sql
-- Migration: Candidate-facing tables for the Pulse platform
-- ============================================================

-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profile_views ──────────────────────────────────────────
-- Tracks which recruiters have viewed a candidate's profile.
CREATE TABLE IF NOT EXISTS profile_views (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_views_candidate ON profile_views (candidate_id, viewed_at DESC);
CREATE INDEX idx_profile_views_recruiter ON profile_views (recruiter_id);

-- ── candidate_matches ──────────────────────────────────────
-- Stores match results between a candidate and a parsed JD.
CREATE TABLE IF NOT EXISTS candidate_matches (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  jd_id           uuid,
  match_score     int         NOT NULL DEFAULT 0,
  matched_skills  text[]      NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, jd_id)
);

CREATE INDEX idx_candidate_matches_candidate ON candidate_matches (candidate_id, match_score DESC);

-- ── daily_challenges ───────────────────────────────────────
-- One challenge per candidate per day to drive engagement.
CREATE TABLE IF NOT EXISTS daily_challenges (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  challenge_type  text        NOT NULL,
  challenge_data  jsonb       NOT NULL DEFAULT '{}',
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_challenges_candidate ON daily_challenges (candidate_id, created_at DESC);

-- ── candidate_streaks ──────────────────────────────────────
-- Tracks consecutive-day activity streaks per candidate.
CREATE TABLE IF NOT EXISTS candidate_streaks (
  candidate_id        uuid    PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  current_streak      int     NOT NULL DEFAULT 0,
  longest_streak      int     NOT NULL DEFAULT 0,
  last_activity_date  date
);

-- ── agent_suggestions ──────────────────────────────────────
-- AI agent tips surfaced to candidates (profile improvements, etc.).
CREATE TABLE IF NOT EXISTS agent_suggestions (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  uuid        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  agent_type    text        NOT NULL,
  suggestion    jsonb       NOT NULL DEFAULT '{}',
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_suggestions_candidate ON agent_suggestions (candidate_id, status);

-- ── parsed_jds ─────────────────────────────────────────────
-- Stores parsed Job Descriptions to trigger opportunity radar scanning logic.
CREATE TABLE IF NOT EXISTS parsed_jds (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_title          text        NOT NULL,
  skills              text[]      NOT NULL DEFAULT '{}',
  experience_years    int         NOT NULL DEFAULT 0,
  location            text        NOT NULL,
  notice_period_days  int         NOT NULL DEFAULT 30,
  raw_text            text        NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_parsed_jds_created_at ON parsed_jds (created_at DESC);
