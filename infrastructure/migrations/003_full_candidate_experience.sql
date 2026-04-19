-- ============================================================
-- 003_full_candidate_experience.sql
-- Migration: Full Candidate Experience tables for Pulse
-- ============================================================

-- candidate_goals (extends candidate profile for onboarding step 5)
CREATE TABLE IF NOT EXISTS candidate_goals (
  candidate_id UUID PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  target_roles TEXT[] DEFAULT '{}',
  target_locations TEXT[] DEFAULT '{}',
  comp_min INT,
  comp_max INT,
  comp_currency TEXT DEFAULT 'INR',
  notice_period_days INT,
  what_learning TEXT[] DEFAULT '{}', -- skills they want to grow into
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- github_repos (candidate's curated showcase)
CREATE TABLE IF NOT EXISTS github_repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  repo_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  ai_generated_readme TEXT,
  inferred_skills TEXT[] DEFAULT '{}',
  commit_count_30d INT DEFAULT 0,
  stars INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- case_studies (project writeups with uploaded files)
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  file_url TEXT, -- Supabase Storage URL
  file_type TEXT, -- pdf, doc, link
  ai_structured_content JSONB DEFAULT '{}', -- agent-generated structured summary
  created_at TIMESTAMPTZ DEFAULT now()
);

-- video_pitches
CREATE TABLE IF NOT EXISTS video_pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(candidate_id) -- one pitch per candidate
);

-- skill_assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  score INT CHECK (score BETWEEN 0 AND 100),
  verified_by_ai BOOLEAN DEFAULT true,
  transcript JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- mock_interviews (extend beyond copilot stateless — persist results)
CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role_title TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  questions JSONB DEFAULT '[]',
  candidate_answers JSONB DEFAULT '[]',
  ai_feedback JSONB DEFAULT '{}',
  overall_score INT,
  shareable_token TEXT UNIQUE, -- recruiter can view with this
  created_at TIMESTAMPTZ DEFAULT now()
);

-- proof_events (the unified activity feed source)
CREATE TABLE IF NOT EXISTS proof_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
      'github_commit','leetcode_solved','mock_interview_completed',
      'skill_assessment_passed','case_study_added','video_pitch_added',
      'readme_generated','skill_added','score_increased'
    )),
  event_data JSONB DEFAULT '{}',
  score_impact INT DEFAULT 0, -- how much this event moved Pulse Score
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proof_events_candidate_created ON proof_events (candidate_id, created_at DESC);

-- recruiter_interest (replaces credit-unlock model)
CREATE TABLE IF NOT EXISTS recruiter_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interest_type TEXT CHECK (interest_type IN ('viewed','saved','shortlisted','unlock_requested','unlocked')),
  recruiter_message TEXT, -- optional note from recruiter when unlock_requested
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  jd_id UUID, -- optional, which JD the interest is tied to
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recruiter_interest_candidate_created ON recruiter_interest (candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_interest_recruiter_status ON recruiter_interest (recruiter_id, status);

-- candidate_intro_drafts (agent-drafted messages for Express Interest)
CREATE TABLE IF NOT EXISTS candidate_intro_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  jd_id UUID,
  draft_text TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  cache_key TEXT, -- hash of candidate_id + jd_id for 24h caching
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_intro_drafts_cache_created ON candidate_intro_drafts (cache_key, created_at DESC);

-- Enable RLS
ALTER TABLE candidate_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_intro_drafts ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Candidates can manage their own data)
CREATE POLICY "Candidates can manage own goals" ON candidate_goals FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can manage own repos" ON github_repos FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can manage own case studies" ON case_studies FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can manage own pitch" ON video_pitches FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can view own assessments" ON skill_assessments FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can view own interviews" ON mock_interviews FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can view own proof events" ON proof_events FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can view interest" ON recruiter_interest FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Candidates can manage own drafts" ON candidate_intro_drafts FOR ALL USING (auth.uid() = candidate_id);

-- Recruiter RLS (Can view candidates in their pipeline)
-- Note: Assuming pipeline table exists from 000_core_tables.sql
CREATE POLICY "Recruiters can view pipeline candidate goals" ON candidate_goals FOR SELECT
  USING (EXISTS (SELECT 1 FROM pipeline WHERE pipeline.candidate_id = candidate_goals.candidate_id AND pipeline.recruiter_id = auth.uid()));

CREATE POLICY "Recruiters can view interest" ON recruiter_interest FOR ALL USING (auth.uid() = recruiter_id);
