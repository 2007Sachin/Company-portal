-- ============================================================
-- Project Pulse — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  professional_headline TEXT,
  bio TEXT,
  location TEXT,
  college TEXT,
  degree TEXT,
  branch TEXT,
  graduation_year INTEGER,
  target_roles TEXT[] DEFAULT '{}',
  ideal_environment TEXT[] DEFAULT '{}',
  company_size_preference TEXT[] DEFAULT '{}',
  work_authorization TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  is_public BOOLEAN DEFAULT true,
  onboarding_step INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- INTEGRATIONS
-- =====================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('github', 'leetcode', 'medium')),
  platform_username TEXT NOT NULL,
  platform_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'syncing', 'error')),
  last_synced_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- =====================
-- PULSE SCORES
-- =====================
CREATE TABLE IF NOT EXISTS pulse_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  velocity_score INTEGER DEFAULT 0 CHECK (velocity_score >= 0 AND velocity_score <= 100),
  consistency_score INTEGER DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  breadth_score INTEGER DEFAULT 0 CHECK (breadth_score >= 0 AND breadth_score <= 100),
  impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
  percentile INTEGER DEFAULT 0,
  breakdown JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- =====================
-- ACTIVITIES
-- =====================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('github', 'leetcode', 'medium')),
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- CAREER PREFERENCES
-- =====================
CREATE TABLE IF NOT EXISTS career_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  target_roles TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  remote_preference TEXT DEFAULT 'flexible' CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'flexible')),
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  notice_period_days INTEGER,
  willing_to_relocate BOOLEAN DEFAULT false,
  preferred_company_sizes TEXT[] DEFAULT '{}',
  preferred_industries TEXT[] DEFAULT '{}',
  job_search_status TEXT DEFAULT 'open_to_offers' CHECK (job_search_status IN ('actively_looking', 'open_to_offers', 'not_looking')),
  available_from DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- PRIVACY SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'recruiters_only', 'private')),
  show_pulse_score BOOLEAN DEFAULT true,
  show_activity_timeline BOOLEAN DEFAULT true,
  show_github_activity BOOLEAN DEFAULT true,
  show_leetcode_stats BOOLEAN DEFAULT true,
  show_medium_articles BOOLEAN DEFAULT true,
  allow_recruiter_contact BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  data_retention_consent BOOLEAN DEFAULT true,
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_occurred_at ON activities(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_scores_user_id ON pulse_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_scores_overall ON pulse_scores(overall_score DESC);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own, public profiles are readable
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (is_public = true);

-- Integrations: users can manage their own
CREATE POLICY "Users can manage own integrations" ON integrations FOR ALL USING (auth.uid() = user_id);

-- Scores: users can view own, public ones are readable
CREATE POLICY "Users can view own score" ON pulse_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public scores are viewable" ON pulse_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = pulse_scores.user_id AND profiles.is_public = true));

-- Activities: users can view own
CREATE POLICY "Users can view own activities" ON activities FOR ALL USING (auth.uid() = user_id);

-- Career preferences: users can manage own
CREATE POLICY "Users can manage own preferences" ON career_preferences FOR ALL USING (auth.uid() = user_id);

-- Privacy settings: users can manage own
CREATE POLICY "Users can manage own privacy" ON privacy_settings FOR ALL USING (auth.uid() = user_id);

-- =====================
-- TRIGGER: Auto-create profile on signup
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.career_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- STORAGE BUCKET
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
