import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';
import { verifyToken, AuthUser } from '@pulse/shared-utils';

export const pipelineRouter = Router();

// Ensure all routes use verifyToken
pipelineRouter.use(verifyToken);

// ── GET /pipeline ───────────────────────────
pipelineRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as AuthUser;
    const supabase = getSupabase();

    const { data: pipelineData, error } = await supabase
      .from('pipeline')
      .select(`
        id,
        stage,
        notes,
        created_at,
        updated_at,
        candidate_id,
        candidates (*)
      `)
      .eq('recruiter_id', user.id);

    if (error) {
      console.error('Fetch pipeline error:', error);
      res.status(500).json({ error: (error as any).message });
      return;
    }

    const pipelineDataArr = pipelineData || [];

    const grouped = {
      saved: pipelineDataArr.filter(d => d.stage === 'saved'),
      shortlisted: pipelineDataArr.filter(d => d.stage === 'shortlisted'),
      pending: pipelineDataArr.filter(d => d.stage === 'pending')
    };

    res.json(grouped);
  } catch (err) {
    console.error('Fetch pipeline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /pipeline/add ──────────────────────
const addSchema = z.object({
  candidate_id: z.string().uuid(),
  stage: z.enum(['saved', 'shortlisted', 'pending'])
});

pipelineRouter.post('/add', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as AuthUser;
    const parsed = addSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: (parsed as any).error.issues });
      return;
    }

    const supabase = getSupabase();

    // Check conflict
    const { data: existing, error: findError } = await supabase
      .from('pipeline')
      .select('id')
      .eq('candidate_id', parsed.data!.candidate_id)
      .eq('recruiter_id', user.id)
      .single();

    if (existing) {
      res.status(409).json({ error: 'Candidate is already in your pipeline' });
      return;
    }

    // Insert
    const { data: inserted, error: insertError } = await supabase
      .from('pipeline')
      .insert([{
        candidate_id: parsed.data!.candidate_id,
        recruiter_id: user.id,
        stage: parsed.data!.stage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert pipeline error:', insertError);
      res.status(400).json({ error: (insertError as any).message });
      return;
    }

    res.status(201).json(inserted);
  } catch (err) {
    console.error('Add to pipeline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /pipeline/:id/move ──────────────────
const moveSchema = z.object({
  stage: z.enum(['saved', 'shortlisted', 'pending'])
});

pipelineRouter.put('/:id/move', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user as AuthUser;
    const parsed = moveSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: (parsed as any).error.issues });
      return;
    }

    const supabase = getSupabase();

    // Ensure it belongs to the recruiter
    const { data: existing, error: fetchError } = await supabase
      .from('pipeline')
      .select('id')
      .eq('id', id)
      .eq('recruiter_id', user.id)
      .single();

    if (!existing) {
      res.status(404).json({ error: 'Pipeline entry not found or unauthorized' });
      return;
    }

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('pipeline')
      .update({
        stage: parsed.data!.stage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update pipeline stage error:', updateError);
      res.status(400).json({ error: (updateError as any).message });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error('Move pipeline stage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /pipeline/:id/notes ─────────────────
const notesSchema = z.object({
  notes: z.string()
});

pipelineRouter.put('/:id/notes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user as AuthUser;
    const parsed = notesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: (parsed as any).error.issues });
      return;
    }

    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('pipeline')
      .select('id')
      .eq('id', id)
      .eq('recruiter_id', user.id)
      .single();

    if (!existing) {
      res.status(404).json({ error: 'Pipeline entry not found or unauthorized' });
      return;
    }

    const { data: updated, error: updateError } = await supabase
      .from('pipeline')
      .update({
        notes: parsed.data!.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update pipeline notes error:', updateError);
      res.status(400).json({ error: (updateError as any).message });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error('Update pipeline notes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /pipeline/:id ────────────────────
pipelineRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user as AuthUser;

    const supabase = getSupabase();
    
    // We can just addeq for auth checks and delete and see if anything deleted
    const { error: deleteError } = await supabase
      .from('pipeline')
      .delete()
      .eq('id', id)
      .eq('recruiter_id', user.id);

    if (deleteError) {
      console.error('Delete pipeline error:', deleteError);
      res.status(400).json({ error: (deleteError as any).message });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete pipeline error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
