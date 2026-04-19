-- ============================================================
-- 004_onboarding_step.sql
-- Migration: Add onboarding_step and full_name to candidates table
-- ============================================================

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update RLS for candidate_goals to allow upsert by owner
CREATE POLICY "Candidates can upsert own goals" 
ON candidate_goals FOR INSERT 
WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own goals" 
ON candidate_goals FOR UPDATE 
USING (auth.uid() = candidate_id);
