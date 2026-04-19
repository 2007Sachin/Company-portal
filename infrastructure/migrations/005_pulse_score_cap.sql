-- ============================================================
-- 005_pulse_score_cap.sql
-- Migration: Update pulse_score cap from 100 to 150
-- ============================================================

-- Attempt to drop common default constraint names for pulse_score
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_pulse_score_check;
    EXCEPTION WHEN undefined_object THEN
        -- Do nothing
    END;
END $$;

-- Add new constraint with 150 cap
ALTER TABLE candidates 
ADD CONSTRAINT pulse_score_range 
CHECK (pulse_score >= 0 AND pulse_score <= 150);
