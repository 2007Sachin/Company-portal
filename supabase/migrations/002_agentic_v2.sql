-- ============================================================
-- 002_agentic_v2.sql
-- New tables for the V2 Agentic Candidate Experience
-- ============================================================

-- 1. AGENT PREFERENCES
CREATE TABLE IF NOT EXISTS agent_preferences (
    candidate_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    autopilot_enabled BOOLEAN DEFAULT false,
    intro_style TEXT DEFAULT 'balanced' CHECK (intro_style IN ('aggressive', 'balanced', 'subtle')),
    target_match_score INTEGER DEFAULT 75,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AGENT FEED
CREATE TABLE IF NOT EXISTS agent_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- match_found, intro_drafted, intel_report, etc.
    title TEXT NOT NULL,
    description TEXT,
    data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'actioned')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_feed_candidate_status ON agent_feed(candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_feed_created_at ON agent_feed(created_at DESC);

-- 3. DRAFTED INTROS
CREATE TABLE IF NOT EXISTS drafted_intros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parsed_jd_id UUID REFERENCES parsed_jds(id) ON DELETE CASCADE,
    draft_text TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'rejected')),
    match_context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INTERVIEW PREP
CREATE TABLE IF NOT EXISTS interview_prep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL, -- references candidate_matches.id
    target_role TEXT,
    company_name TEXT,
    prep_data JSONB DEFAULT '{}', -- Questions, hints, research
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. JOB EVALUATIONS
CREATE TABLE IF NOT EXISTS job_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL, -- references candidate_matches.id
    analysis JSONB DEFAULT '{}', -- Match logic, gaps, why you
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SEARCH CONVERSATIONS
CREATE TABLE IF NOT EXISTS job_search_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE agent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafted_intros ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_search_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON agent_preferences FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users can view own feed" ON agent_feed FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users can manage own intros" ON drafted_intros FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users can view own prep" ON interview_prep FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users can view own evaluations" ON job_evaluations FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Users can manage own search" ON job_search_conversations FOR ALL USING (auth.uid() = candidate_id);
