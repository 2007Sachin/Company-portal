-- ============================================================
-- 000_core_tables.sql
-- Foundation tables required by 001_initial_schema.sql and
-- 002_candidate_side.sql. Must execute first (alphabetical order).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'candidate'
                          CHECK (role IN ('recruiter', 'candidate')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS candidates (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline            TEXT,
  pulse_score         INTEGER     NOT NULL DEFAULT 50
                                  CHECK (pulse_score >= 0 AND pulse_score <= 100),
  experience_years    INTEGER     NOT NULL DEFAULT 0,
  notice_period_days  INTEGER     NOT NULL DEFAULT 30,
  skills              TEXT[]      NOT NULL DEFAULT '{}',
  github_verified     BOOLEAN     NOT NULL DEFAULT false,
  leetcode_verified   BOOLEAN     NOT NULL DEFAULT false,
  has_video_pitch     BOOLEAN     NOT NULL DEFAULT false,
  location            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidates_pulse_score ON candidates(pulse_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_location    ON candidates(location);

CREATE TABLE IF NOT EXISTS pipeline (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  UUID        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id  UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  stage         TEXT        NOT NULL DEFAULT 'saved'
                            CHECK (stage IN ('saved', 'shortlisted', 'pending')),
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, recruiter_id)
);
CREATE INDEX IF NOT EXISTS idx_pipeline_recruiter_stage ON pipeline(recruiter_id, stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_candidate       ON pipeline(candidate_id);

CREATE TABLE IF NOT EXISTS parsed_jds (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_title          TEXT        NOT NULL,
  skills              TEXT[]      NOT NULL DEFAULT '{}',
  experience_years    INTEGER     NOT NULL DEFAULT 0,
  location            TEXT        NOT NULL,
  notice_period_days  INTEGER     NOT NULL DEFAULT 30,
  raw_text            TEXT        NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_parsed_jds_created_at ON parsed_jds(created_at DESC);

ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline   ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_jds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "candidates_select_all" ON candidates FOR SELECT USING (true);
CREATE POLICY "candidates_insert_own" ON candidates FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "candidates_update_own" ON candidates FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "pipeline_owner_all" ON pipeline FOR ALL USING (auth.uid() = recruiter_id);

CREATE POLICY "parsed_jds_select_auth" ON parsed_jds
  FOR SELECT USING (auth.role() = 'authenticated');
