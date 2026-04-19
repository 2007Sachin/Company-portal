"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../lib/supabase");
const shared_utils_1 = require("@pulse/shared-utils");
exports.recruiterRouter = (0, express_1.Router)();
// All /recruiters routes require authentication
exports.recruiterRouter.use(shared_utils_1.verifyToken);
function getUser(req) {
    return req.user;
}
// ── GET /recruiters/me/requests ───────────────────────────
// GET inbound applications from candidates
exports.recruiterRouter.get('/me/requests', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
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
exports.recruiterRouter.put('/me/requests/:id/respond', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const { status } = req.body; // 'accepted' | 'declined'
        const supabase = (0, supabase_1.getSupabase)();
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
const signalSchema = zod_1.z.object({
    candidate_id: zod_1.z.string().uuid(),
    interest_type: zod_1.z.enum(['viewed', 'saved', 'shortlisted', 'unlock_requested']),
    recruiter_message: zod_1.z.string().optional(),
    jd_id: zod_1.z.string().uuid().optional(),
});
exports.recruiterRouter.post('/me/signals', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = signalSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
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