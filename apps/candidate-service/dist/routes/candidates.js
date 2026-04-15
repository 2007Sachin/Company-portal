"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidatesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../lib/supabase");
const shared_utils_1 = require("@pulse/shared-utils");
exports.candidatesRouter = (0, express_1.Router)();
// ── Validation Schema ──────────────────────
const candidateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    headline: zod_1.z.string().optional().nullable(),
    pulse_score: zod_1.z.number().int().optional().nullable(),
    experience_years: zod_1.z.number().int().optional().nullable(),
    notice_period_days: zod_1.z.number().int().optional().nullable(),
    skills: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    github_verified: zod_1.z.boolean().optional().nullable(),
    leetcode_verified: zod_1.z.boolean().optional().nullable(),
    has_video_pitch: zod_1.z.boolean().optional().nullable(),
    location: zod_1.z.string().optional().nullable()
});
// ── GET /candidates (Discovery) ─────────────
exports.candidatesRouter.get('/', async (req, res) => {
    try {
        const { skills, min_score, max_score, max_notice_period, min_experience, max_experience, search } = req.query;
        const supabase = (0, supabase_1.getSupabase)();
        let query = supabase.from('candidates').select('*', { count: 'exact' });
        if (search) {
            query = query.ilike('headline', `%${search}%`);
        }
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            // Supabase contains array overlapping
            query = query.contains('skills', skillsArray);
        }
        if (min_score)
            query = query.gte('pulse_score', parseInt(min_score, 10));
        if (max_score)
            query = query.lte('pulse_score', parseInt(max_score, 10));
        if (max_notice_period)
            query = query.lte('notice_period_days', parseInt(max_notice_period, 10));
        if (min_experience)
            query = query.gte('experience_years', parseInt(min_experience, 10));
        if (max_experience)
            query = query.lte('experience_years', parseInt(max_experience, 10));
        // Default sorting
        query = query.order('pulse_score', { ascending: false });
        const { data, error, count } = await query;
        if (error) {
            console.error('Fetch candidates error:', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ candidates: data, total: count || 0 });
    }
    catch (err) {
        console.error('Fetch candidates error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/:id ─────────────────────
exports.candidatesRouter.get('/:id', shared_utils_1.verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
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
    }
    catch (err) {
        console.error('Fetch candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates ────────────────────────
exports.candidatesRouter.post('/', shared_utils_1.verifyToken, async (req, res) => {
    try {
        const parsed = candidateSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
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
            res.status(400).json({ error: error.message });
            return;
        }
        res.status(201).json(data);
    }
    catch (err) {
        console.error('Create candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /candidates/:id ─────────────────────
exports.candidatesRouter.put('/:id', shared_utils_1.verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const parsed = candidateSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('candidates')
            .update(parsed.data)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Update candidate error:', error);
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('Update candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/:id/score ───────────────
exports.candidatesRouter.get('/:id/score', shared_utils_1.verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = (0, supabase_1.getSupabase)();
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
        if (candidate.github_verified)
            score += 20;
        if (candidate.leetcode_verified)
            score += 15;
        if (candidate.has_video_pitch)
            score += 10;
        const skillsCount = Array.isArray(candidate.skills) ? candidate.skills.length : 0;
        score += Math.min(skillsCount * 5, 25);
        score = Math.min(score, 100);
        // Update DB
        const { error: updateError } = await supabase
            .from('candidates')
            .update({ pulse_score: score })
            .eq('id', id);
        if (updateError) {
            console.error('Failed to update score:', updateError);
            res.status(500).json({ error: 'Failed to save updated score' });
            return;
        }
        res.json({ pulse_score: score });
    }
    catch (err) {
        console.error('Calculate score error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=candidates.js.map