import { Router } from 'express';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';
import { verifyToken } from '@pulse/shared-utils';
export const recruiterRouter = Router();
// All /recruiters routes require authentication
recruiterRouter.use(verifyToken);
function getUser(req) {
    return req.user;
}
// ── GET /recruiters/me/requests ───────────────────────────
// GET inbound applications from candidates
recruiterRouter.get('/me/requests', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        // Fetch applications for this recruiter's JDs or direct requests
        const { data, error } = await supabase
            .from('candidate_interest')
            .select('*, candidates(*), parsed_jds(*)')
            .eq('recruiter_id', user.id)
            .order('created_at', { ascending: false });
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /recruiters/me/requests/:id/respond ────────────────
recruiterRouter.put('/me/requests/:id/respond', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const { status } = req.body; // 'accepted' | 'declined'
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('candidate_interest')
            .update({
            status,
            responded_at: new Date().toISOString()
        })
            .eq('id', id)
            .eq('recruiter_id', user.id)
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /recruiters/me/signals ─────────────────────────────
// Record Viewed, Saved, Shortlisted, or Unlock Requested
const signalSchema = z.object({
    candidate_id: z.string().uuid(),
    interest_type: z.enum(['viewed', 'saved', 'shortlisted', 'unlock_requested']),
    recruiter_message: z.string().optional(),
    jd_id: z.string().uuid().optional(),
});
recruiterRouter.post('/me/signals', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = signalSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
        const { candidate_id, interest_type, recruiter_message, jd_id } = parsed.data;
        // 1. Deduplicate 'viewed' signals within 24h
        if (interest_type === 'viewed') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data: existing } = await supabase
                .from('recruiter_interest')
                .select('id')
                .eq('recruiter_id', user.id)
                .eq('candidate_id', candidate_id)
                .eq('interest_type', 'viewed')
                .gte('created_at', twentyFourHoursAgo)
                .maybeSingle();
            if (existing) {
                res.json({ status: 'ignored_duplicate' });
                return;
            }
        }
        // 2. Insert signal
        const { data, error } = await supabase
            .from('recruiter_interest')
            .insert({
            recruiter_id: user.id,
            candidate_id,
            interest_type,
            recruiter_message,
            jd_id,
            status: interest_type === 'unlock_requested' ? 'pending' : 'accepted' // views/saves are auto-accepted
        })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=recruiter.js.map