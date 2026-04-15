"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelineRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../lib/supabase");
const shared_utils_1 = require("@pulse/shared-utils");
exports.pipelineRouter = (0, express_1.Router)();
// Ensure all routes use verifyToken
exports.pipelineRouter.use(shared_utils_1.verifyToken);
// ── GET /pipeline ───────────────────────────
exports.pipelineRouter.get('/', async (req, res) => {
    try {
        const user = req.user;
        const supabase = (0, supabase_1.getSupabase)();
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
            res.status(500).json({ error: error.message });
            return;
        }
        const grouped = {
            saved: pipelineData.filter(d => d.stage === 'saved'),
            shortlisted: pipelineData.filter(d => d.stage === 'shortlisted'),
            pending: pipelineData.filter(d => d.stage === 'pending')
        };
        res.json(grouped);
    }
    catch (err) {
        console.error('Fetch pipeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /pipeline/add ──────────────────────
const addSchema = zod_1.z.object({
    candidate_id: zod_1.z.string().uuid(),
    stage: zod_1.z.enum(['saved', 'shortlisted', 'pending'])
});
exports.pipelineRouter.post('/add', async (req, res) => {
    try {
        const user = req.user;
        const parsed = addSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
        // Check conflict
        const { data: existing, error: findError } = await supabase
            .from('pipeline')
            .select('id')
            .eq('candidate_id', parsed.data.candidate_id)
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
                candidate_id: parsed.data.candidate_id,
                recruiter_id: user.id,
                stage: parsed.data.stage,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (insertError) {
            console.error('Insert pipeline error:', insertError);
            res.status(400).json({ error: insertError.message });
            return;
        }
        res.status(201).json(inserted);
    }
    catch (err) {
        console.error('Add to pipeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /pipeline/:id/move ──────────────────
const moveSchema = zod_1.z.object({
    stage: zod_1.z.enum(['saved', 'shortlisted', 'pending'])
});
exports.pipelineRouter.put('/:id/move', async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const parsed = moveSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
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
            stage: parsed.data.stage,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            console.error('Update pipeline stage error:', updateError);
            res.status(400).json({ error: updateError.message });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error('Move pipeline stage error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /pipeline/:id/notes ─────────────────
const notesSchema = zod_1.z.object({
    notes: zod_1.z.string()
});
exports.pipelineRouter.put('/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const parsed = notesSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
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
            notes: parsed.data.notes,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            console.error('Update pipeline notes error:', updateError);
            res.status(400).json({ error: updateError.message });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error('Update pipeline notes error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── DELETE /pipeline/:id ────────────────────
exports.pipelineRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const supabase = (0, supabase_1.getSupabase)();
        // We can just addeq for auth checks and delete and see if anything deleted
        const { error: deleteError } = await supabase
            .from('pipeline')
            .delete()
            .eq('id', id)
            .eq('recruiter_id', user.id);
        if (deleteError) {
            console.error('Delete pipeline error:', deleteError);
            res.status(400).json({ error: deleteError.message });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete pipeline error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=pipeline.js.map