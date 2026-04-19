-- Migration: 007_candidate_interest.sql
-- Separate table for Candidate -> Recruiter interest signals (applications)

CREATE TABLE IF NOT EXISTS candidate_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jd_id UUID NOT NULL REFERENCES parsed_jds(id) ON DELETE CASCADE,
  message TEXT, -- The AI draft or personalized intro
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(candidate_id, jd_id) -- Prevent double applications for same role
);

CREATE INDEX IF NOT EXISTS idx_candidate_interest_recruiter_status ON candidate_interest (recruiter_id, status);
CREATE INDEX IF NOT EXISTS idx_candidate_interest_candidate ON candidate_interest (candidate_id);

-- Enable RLS
ALTER TABLE candidate_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can manage own interest" ON candidate_interest FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Recruiters can view inbound interest" ON candidate_interest FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters can update interest status" ON candidate_interest FOR UPDATE USING (auth.uid() = recruiter_id);

-- Add recruiter_id to parsed_jds if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parsed_jds' AND column_name='recruiter_id') THEN
    ALTER TABLE parsed_jds ADD COLUMN recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
