-- Migration: 006_opportunity_extras.sql
-- Description: Adds qualitative metadata to matches and dismissed/saved status.

ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS saved_at TIMESTAMPTZ;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS why_you TEXT;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS growth_opportunity TEXT;
ALTER TABLE candidate_matches ADD COLUMN IF NOT EXISTS missing_skills TEXT[] DEFAULT '{}';

-- Index for filtering out dismissed matches and finding saved ones
CREATE INDEX IF NOT EXISTS idx_candidate_matches_status ON candidate_matches (candidate_id) WHERE (dismissed_at IS NULL);
