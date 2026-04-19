import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';
import { verifyToken } from '@pulse/shared-utils';

export const candidatesRouter = Router();

// ── Validation Schema ──────────────────────
const candidateSchema = z.object({
  id: z.string().uuid().optional(),
  headline: z.string().optional().nullable(),
  pulse_score: z.number().int().optional().nullable(),
  experience_years: z.number().int().optional().nullable(),
  notice_period_days: z.number().int().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  github_verified: z.boolean().optional().nullable(),
  leetcode_verified: z.boolean().optional().nullable(),
  has_video_pitch: z.boolean().optional().nullable(),
  location: z.string().optional().nullable()
});

// ── GET /candidates (Discovery) ─────────────
candidatesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  // --- MOCK OVERRIDE ---
  const mockCandidates = [
    { id: 'c-1', headline: 'Senior Frontend Developer', pulse_score: 950, experience_years: 6, notice_period_days: 15, skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'], github_verified: true, leetcode_verified: true, has_video_pitch: true, location: 'San Francisco, CA', created_at: new Date().toISOString() },
    { id: 'c-2', headline: 'Backend Engineer', pulse_score: 820, experience_years: 4, notice_period_days: 30, skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'], github_verified: true, leetcode_verified: false, has_video_pitch: false, location: 'Remote', created_at: new Date().toISOString() },
    { id: 'c-3', headline: 'Full Stack Ninja', pulse_score: 750, experience_years: 3, notice_period_days: 0, skills: ['React', 'Python', 'Django', 'AWS'], github_verified: false, leetcode_verified: false, has_video_pitch: false, location: 'New York, NY', created_at: new Date().toISOString() },
  ];
  res.json({ candidates: mockCandidates, total: mockCandidates.length });
  return;
  // ---------------------
  try {
    const {
      skills,
      min_score,
      max_score,
      max_notice_period,
      min_experience,
      max_experience,
      search
    } = req.query;

    const supabase = getSupabase();
    let query = supabase.from('candidates').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('headline', `%${search}%`);
    }

    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim());
      // Supabase contains array overlapping
      query = query.contains('skills', skillsArray);
    }

    if (min_score) query = query.gte('pulse_score', parseInt(min_score as string, 10));
    if (max_score) query = query.lte('pulse_score', parseInt(max_score as string, 10));
    if (max_notice_period) query = query.lte('notice_period_days', parseInt(max_notice_period as string, 10));
    if (min_experience) query = query.gte('experience_years', parseInt(min_experience as string, 10));
    if (max_experience) query = query.lte('experience_years', parseInt(max_experience as string, 10));

    // Default sorting
    query = query.order('pulse_score', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Fetch candidates error:', error);
      res.status(500).json({ error: (error as any).message });
      return;
    }

    res.json({ candidates: data, total: count || 0 });
  } catch (err) {
    console.error('Fetch candidates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /candidates/:id ─────────────────────
candidatesRouter.get('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  // --- MOCK OVERRIDE ---
  res.json({ id: req.params.id, headline: 'Mock Candidate', pulse_score: 900, experience_years: 5, notice_period_days: 15, skills: ['React', 'Node'], github_verified: true, leetcode_verified: true, has_video_pitch: true, location: 'Remote', created_at: new Date().toISOString() });
  return;
  // ---------------------
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    console.error('Fetch candidate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /candidates ────────────────────────
candidatesRouter.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  // --- MOCK OVERRIDE ---
  res.status(201).json({ id: 'c-new', ...req.body, created_at: new Date().toISOString() });
  return;
  // ---------------------
  try {
    const parsed = candidateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: (parsed as any).error.issues });
      return;
    }

    const supabase = getSupabase();
    // Default id to req.user.id if self-registering, else expect body.id or auto-generate if uuid extension active
    const candidateData = {
      ...parsed.data,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single();

    if (error) {
      console.error('Insert candidate error:', error);
      res.status(400).json({ error: (error as any).message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Create candidate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /candidates/:id ─────────────────────
candidatesRouter.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  // --- MOCK OVERRIDE ---
  res.json({ id: req.params.id, ...req.body, updated_at: new Date().toISOString() });
  return;
  // ---------------------
  try {
    const { id } = req.params;
    const parsed = candidateSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: (parsed as any).error.issues });
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('candidates')
      .update(parsed.data!)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update candidate error:', error);
      res.status(400).json({ error: (error as any).message });
      return;
    }

    res.json(data);
  } catch (err) {
    console.error('Update candidate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /candidates/:id/score ───────────────
candidatesRouter.get('/:id/score', verifyToken, async (req: Request, res: Response): Promise<void> => {
   // --- MOCK OVERRIDE ---
   res.json({ pulse_score: 850 });
   return;
   // ---------------------
   try {
     const { id } = req.params;
     const supabase = getSupabase();
 
     // Fetch candidate
     const { data: candidate, error: fetchError } = await supabase
       .from('candidates')
       .select('github_verified, leetcode_verified, has_video_pitch, skills')
       .eq('id', id)
       .single();
 
     if (fetchError || !candidate) {
       res.status(404).json({ error: 'Candidate not found' });
       return;
     }
 
     // Calculate Score
     let score = 50;
     if (candidate!.github_verified) score += 20;
     if (candidate!.leetcode_verified) score += 15;
     if (candidate!.has_video_pitch) score += 10;
     
     const skillsCount = Array.isArray(candidate!.skills) ? (candidate!.skills as any[]).length : 0;
     score += Math.min(skillsCount * 5, 25);
     
     score = Math.min(score, 100);
 
     // Update DB
     const { error: updateError } = await supabase
       .from('candidates')
       .update({ pulse_score: score })
       .eq('id', id);
       
     if (updateError) {
        console.error('Failed to update score:', updateError);
        res.status(500).json({ error: (updateError as any).message });
        return;
     }
 
     res.json({ pulse_score: score });
   } catch (err) {
     console.error('Calculate score error:', err);
     res.status(500).json({ error: 'Internal server error' });
   }
});
