"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const supabase_1 = require("../lib/supabase");
const shared_utils_1 = require("@pulse/shared-utils");
exports.meRouter = (0, express_1.Router)();
// All /candidates/me routes require authentication
exports.meRouter.use(shared_utils_1.verifyToken);
// Helper to pull the authenticated user from request
function getUser(req) {
    return req.user;
}
// ── GET /candidates/me ─────────────────────────────────────
// Returns the current candidate's profile from the candidates table.
exports.meRouter.get('/', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', user.id)
            .single();
        if (error || !data) {
            res.status(404).json({ error: 'Candidate profile not found' });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[GET /candidates/me]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /candidates/me ─────────────────────────────────────
// Updates the current candidate's profile.
const updateProfileSchema = zod_1.z.object({
    headline: zod_1.z.string().optional(),
    experience_years: zod_1.z.number().int().optional(),
    notice_period_days: zod_1.z.number().int().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    github_verified: zod_1.z.boolean().optional(),
    leetcode_verified: zod_1.z.boolean().optional(),
    has_video_pitch: zod_1.z.boolean().optional(),
    location: zod_1.z.string().optional(),
}).strict();
exports.meRouter.put('/', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('candidates')
            .update(parsed.data)
            .eq('id', user.id)
            .select()
            .single();
        if (error) {
            console.error('[PUT /candidates/me]', error);
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[PUT /candidates/me]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/views ───────────────────────────────
// Returns profile view count and recent view entries.
exports.meRouter.get('/views', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        // Total count
        const { count, error: countError } = await supabase
            .from('profile_views')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', user.id);
        if (countError) {
            console.error('[GET /candidates/me/views] count:', countError);
            res.status(500).json({ error: countError.message });
            return;
        }
        // Recent 20 entries
        const { data: recent, error: recentError } = await supabase
            .from('profile_views')
            .select('id, recruiter_id, viewed_at')
            .eq('candidate_id', user.id)
            .order('viewed_at', { ascending: false })
            .limit(20);
        if (recentError) {
            console.error('[GET /candidates/me/views] recent:', recentError);
            res.status(500).json({ error: recentError.message });
            return;
        }
        res.json({ total_views: count ?? 0, recent: recent ?? [] });
    }
    catch (err) {
        console.error('[GET /candidates/me/views]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/matches ─────────────────────────────
// Returns candidate_matches ordered by match_score descending.
exports.meRouter.get('/matches', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('candidate_matches')
            .select('*')
            .eq('candidate_id', user.id)
            .order('match_score', { ascending: false });
        if (error) {
            console.error('[GET /candidates/me/matches]', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ matches: data ?? [] });
    }
    catch (err) {
        console.error('[GET /candidates/me/matches]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/streak ──────────────────────────────
// Returns the candidate's current streak info.
exports.meRouter.get('/streak', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('candidate_streaks')
            .select('*')
            .eq('candidate_id', user.id)
            .single();
        if (error) {
            // No streak record yet — return defaults
            res.json({ current_streak: 0, longest_streak: 0, last_activity_date: null });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[GET /candidates/me/streak]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/challenge/today ─────────────────────
// Fetches today's challenge or generates a new one if missing.
exports.meRouter.get('/challenge/today', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const today = new Date().toISOString().slice(0, 10); // YRRR-MM-DD
        // 1. Check if challenge already exists for today
        const { data: existing, error: fetchError } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('candidate_id', user.id)
            .gte('created_at', `${today}T00:00:00Z`)
            .lt('created_at', `${today}T23:59:59Z`)
            .maybeSingle();
        if (existing) {
            res.json(existing);
            return;
        }
        // 2. Generate a new challenge
        const { data: candidate } = await supabase
            .from('candidates')
            .select('skills')
            .eq('id', user.id)
            .single();
        const pool = [
            { type: 'leetcode', title: 'Solve 1 LeetCode Easy' },
            { type: 'github_commit', title: 'Push 1 commit to any repo' },
            { type: 'add_skill', title: 'Add 1 new skill to your profile' },
            { type: 'video_pitch', title: 'Record a 60-second intro' }
        ];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        let challenge_title = chosen.title;
        if (chosen.type === 'leetcode' && candidate?.skills && candidate.skills.length > 0) {
            const skill = candidate.skills[Math.floor(Math.random() * candidate.skills.length)];
            challenge_title = `${chosen.title} in ${skill}`;
        }
        const { data: newChallenge, error: insertError } = await supabase
            .from('daily_challenges')
            .insert({
            candidate_id: user.id,
            challenge_type: chosen.type,
            challenge_data: { title: challenge_title }
        })
            .select()
            .single();
        if (insertError) {
            console.error('[GET /challenge/today] insert error:', insertError);
            res.status(500).json({ error: 'Failed to generate challenge' });
            return;
        }
        res.json(newChallenge);
    }
    catch (err) {
        console.error('[GET /candidates/me/challenge/today]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates/me/challenges/complete ────────────────
// Marks today's challenge as completed and updates the streak. Standardized logic.
const completeChallengeSchema = zod_1.z.object({
    challenge_id: zod_1.z.string().uuid(),
});
exports.meRouter.post('/challenges/complete', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = completeChallengeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        // 1. Mark the challenge as completed
        const { data: challenge, error: challengeError } = await supabase
            .from('daily_challenges')
            .update({ completed_at: now.toISOString() })
            .eq('id', parsed.data.challenge_id)
            .eq('candidate_id', user.id)
            .is('completed_at', null)
            .select()
            .single();
        if (challengeError || !challenge) {
            res.status(404).json({ error: 'Challenge not found or already completed' });
            return;
        }
        // 2. Update Streak
        const { data: streak } = await supabase
            .from('candidate_streaks')
            .select('*')
            .eq('candidate_id', user.id)
            .single();
        let newCurrent = 1;
        if (streak && streak.last_activity_date) {
            const lastDate = new Date(streak.last_activity_date);
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            if (streak.last_activity_date === yesterdayStr) {
                newCurrent = streak.current_streak + 1;
            }
            else if (streak.last_activity_date === todayStr) {
                newCurrent = streak.current_streak; // Already done today
            }
            // else if streak.last_activity_date was older than yesterday, it resets to 1 (which it is by default)
        }
        const newLongest = Math.max(newCurrent, (streak?.longest_streak || 0));
        const { data: updatedStreak, error: streakError } = await supabase
            .from('candidate_streaks')
            .upsert({
            candidate_id: user.id,
            current_streak: newCurrent,
            longest_streak: newLongest,
            last_activity_date: todayStr,
        }, { onConflict: 'candidate_id' })
            .select()
            .single();
        if (streakError) {
            console.error('[POST /challenges/complete] streak error:', streakError);
        }
        res.json(updatedStreak || { current_streak: newCurrent, longest_streak: newLongest });
    }
    catch (err) {
        console.error('[POST /candidates/me/challenges/complete]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/challenges ──────────────────────────
// Returns history of challenges (for the heatmap).
exports.meRouter.get('/challenges', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[GET /candidates/me/challenges]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/suggestions ─────────────────────────
// Returns pending agent suggestions for the current candidate.
exports.meRouter.get('/suggestions', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('agent_suggestions')
            .select('*')
            .eq('candidate_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('[GET /candidates/me/suggestions]', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ suggestions: data ?? [] });
    }
    catch (err) {
        console.error('[GET /candidates/me/suggestions]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /candidates/me/suggestions/:id ─────────────────────
// Updates an agent suggestion status (accepted / dismissed).
const updateSuggestionSchema = zod_1.z.object({
    status: zod_1.z.enum(['accepted', 'dismissed']),
});
exports.meRouter.put('/suggestions/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const parsed = updateSuggestionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = (0, supabase_1.getSupabase)();
        const { data, error } = await supabase
            .from('agent_suggestions')
            .update({ status: parsed.data.status })
            .eq('id', id)
            .eq('candidate_id', user.id) // ensure ownership
            .select()
            .single();
        if (error || !data) {
            res.status(404).json({ error: 'Suggestion not found' });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[PUT /candidates/me/suggestions/:id]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates/me/recompute-matches ──────────────────
// Manually triggers a re-scan of the latest 50 parsed JDs.
exports.meRouter.post('/recompute-matches', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = (0, supabase_1.getSupabase)();
        const COPILOT_SERVICE_URL = process.env.COPILOT_SERVICE_URL || 'http://copilot-service:3005';
        // 1. Get candidate profile
        const { data: candidate, error: candError } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', user.id)
            .single();
        if (candError || !candidate) {
            res.status(404).json({ error: 'Candidate not found' });
            return;
        }
        // 2. Fetch latest 50 parsed JDs
        const { data: jds, error: jdsError } = await supabase
            .from('parsed_jds')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (jdsError) {
            console.error('[POST /recompute-matches] jds fetch error:', jdsError);
            res.status(500).json({ error: jdsError.message });
            return;
        }
        const matchesToUpsert = [];
        // 3. Loop through JDs and call copilot-service
        const batchSize = 10;
        for (let i = 0; i < (jds?.length || 0); i += batchSize) {
            const batch = jds.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(async (jd) => {
                try {
                    // Using global fetch (Node 18+)
                    const response = await fetch(`${COPILOT_SERVICE_URL}/copilot/match-score`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            candidate,
                            parsed_jd: jd,
                            is_bulk: true
                        })
                    });
                    if (!response.ok)
                        return null;
                    const result = (await response.json());
                    if (result.match_score >= 70) {
                        return {
                            candidate_id: candidate.id,
                            jd_id: jd.id,
                            match_score: result.match_score,
                            matched_skills: result.matched_skills,
                            created_at: new Date().toISOString()
                        };
                    }
                }
                catch (err) {
                    console.error(`Error matching against JD ${jd.id}:`, err);
                }
                return null;
            }));
            results.forEach(m => { if (m)
                matchesToUpsert.push(m); });
        }
        // 4. Upsert into candidate_matches
        if (matchesToUpsert.length > 0) {
            const { error: upsertError } = await supabase
                .from('candidate_matches')
                .upsert(matchesToUpsert, { onConflict: 'candidate_id,jd_id' });
            if (upsertError) {
                console.error('[POST /recompute-matches] upsert error:', upsertError);
                res.status(500).json({ error: upsertError.message });
                return;
            }
        }
        res.json({ success: true, matches_found: matchesToUpsert.length });
    }
    catch (err) {
        console.error('[POST /candidates/me/recompute-matches]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=me.js.map