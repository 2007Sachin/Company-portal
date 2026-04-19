-- ============================================================
-- Storage Setup: Buckets and RLS Policies
-- ============================================================

-- Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('case-study-files', 'case-study-files', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('video-pitches', 'video-pitches', false, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('profile-avatars', 'profile-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for Storage

-- case-study-files: Candidate own access
CREATE POLICY "Candidates can upload own case study files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'case-study-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Candidates can view own case study files" ON storage.objects
  FOR SELECT USING (bucket_id = 'case-study-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- case-study-files: Recruiters in pipeline
CREATE POLICY "Recruiters can view pipeline candidate case studies" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-study-files' AND 
    EXISTS (
      SELECT 1 FROM pipeline 
      WHERE pipeline.candidate_id::text = (storage.foldername(name))[1] 
      AND pipeline.recruiter_id = auth.uid()
    )
  );

-- video-pitches: Candidate own access
CREATE POLICY "Candidates can upload own pitch video" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'video-pitches' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Candidates can view own pitch video" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-pitches' AND (storage.foldername(name))[1] = auth.uid()::text);

-- video-pitches: Recruiters in pipeline
CREATE POLICY "Recruiters can view pipeline candidate pitches" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'video-pitches' AND 
    EXISTS (
      SELECT 1 FROM pipeline 
      WHERE pipeline.candidate_id::text = (storage.foldername(name))[1] 
      AND pipeline.recruiter_id = auth.uid()
    )
  );

-- profile-avatars: Public read, own write
CREATE POLICY "Avatar public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
