-- ============================================================
-- 008_candidate_cockpit_upgrade.sql
-- Compatibility migration for the full Pulse candidate cockpit
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'recruiters_only'
  CHECK (profile_visibility IN ('public', 'recruiters_only', 'hidden'));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS allow_recruiter_contact BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS show_github_activity BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS show_leetcode_stats BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS data_consent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_company_types TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_work_setup TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_ctc_min INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_ctc_max INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_username TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_total_solved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_easy_solved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_medium_solved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_hard_solved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS leetcode_contest_rating INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_username_unique
  ON candidates (lower(username))
  WHERE username IS NOT NULL;

ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS company_type TEXT;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS company_size_range TEXT;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS remote_type TEXT;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS ctc_min INTEGER;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS ctc_max INTEGER;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS jd_summary TEXT;
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE parsed_jds ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS parsed_jd_id UUID REFERENCES parsed_jds(id) ON DELETE CASCADE;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS matching_skills TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS match_reasoning TEXT;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'
  CHECK (status IN ('new', 'seen', 'interested', 'dismissed', 'engaged'));
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS candidate_intro_message TEXT;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE candidate_matches
SET parsed_jd_id = jd_id
WHERE parsed_jd_id IS NULL
  AND jd_id IS NOT NULL;

UPDATE candidate_matches
SET matching_skills = matched_skills
WHERE matching_skills = '{}'
  AND matched_skills IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidate_matches_candidate_status
  ON candidate_matches (candidate_id, status, match_score DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_matches_candidate_parsed_jd
  ON candidate_matches (candidate_id, parsed_jd_id)
  WHERE parsed_jd_id IS NOT NULL;

ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';

CREATE TABLE IF NOT EXISTS search_appearances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  search_query TEXT,
  appeared_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_appearances_candidate_date
  ON search_appearances (candidate_id, appeared_at DESC);

CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL
    CHECK (agent_type IN ('profile_optimizer', 'github_curator', 'mock_interview', 'opportunity_radar', 'score_coach')),
  action_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_candidate_date
  ON agent_actions (candidate_id, created_at DESC);

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_candidate_date
  ON activity_events (candidate_id, created_at DESC);

ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS challenge_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;

UPDATE daily_challenges
SET challenge_date = COALESCE(challenge_date, created_at::date),
    completed = COALESCE(completed, completed_at IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenges_candidate_unique_date
  ON daily_challenges (candidate_id, challenge_date);

ALTER TABLE candidate_streaks ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE candidate_streaks ADD COLUMN IF NOT EXISTS total_completed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE candidate_streaks ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE candidate_streaks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE candidate_streaks
SET last_completed_date = COALESCE(last_completed_date, last_activity_date);

ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

UPDATE case_studies
SET tags = COALESCE(tags, skills, '{}');

ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS format TEXT
  CHECK (format IN ('technical', 'behavioral', 'system_design', 'mixed'));
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS overall_score NUMERIC(3,1);
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS strengths TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS improvements TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE mock_interviews ADD COLUMN IF NOT EXISTS questions_v2 JSONB;

UPDATE mock_interviews
SET target_role = COALESCE(target_role, role_title),
    overall_score = COALESCE(overall_score, overall_score::numeric),
    questions_v2 = COALESCE(questions_v2, questions);

ALTER TABLE search_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'search_appearances'
      AND policyname = 'Candidates can view own search appearances'
  ) THEN
    CREATE POLICY "Candidates can view own search appearances"
      ON search_appearances FOR SELECT
      USING (auth.uid() = candidate_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'agent_actions'
      AND policyname = 'Candidates can view own agent actions'
  ) THEN
    CREATE POLICY "Candidates can view own agent actions"
      ON agent_actions FOR SELECT
      USING (auth.uid() = candidate_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'activity_events'
      AND policyname = 'Candidates can view own activity events'
  ) THEN
    CREATE POLICY "Candidates can view own activity events"
      ON activity_events FOR SELECT
      USING (auth.uid() = candidate_id);
  END IF;
END $$;
