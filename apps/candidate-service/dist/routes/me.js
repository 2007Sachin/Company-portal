import { Router } from 'express';
import { z } from 'zod';
import { getSupabase } from '../lib/supabase.js';
import { emitProofEvent, recalculatePulseScore } from '../lib/proof.js';
import { verifyToken } from '@pulse/shared-utils';
export const meRouter = Router();
// All /candidates/me routes require authentication
meRouter.use(verifyToken);
// Helper to pull the authenticated user from request
function getUser(req) {
    return req.user;
}
// ── GET /candidates/me/dashboard ───────────────────────────
// Aggregated endpoint for the Career Cockpit
meRouter.get('/dashboard', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [candidateRes, streakRes, deltaRes, challengeRes, eventsRes, gridRes, matchesRes, interestsRes, historyRes] = await Promise.all([
            // 1. Profile
            supabase.from('candidates').select('*').eq('id', user.id).single(),
            // 2. Streak
            supabase.from('candidate_streaks').select('*').eq('candidate_id', user.id).maybeSingle(),
            // 3. 7d Delta
            supabase.from('proof_events').select('score_impact').eq('candidate_id', user.id).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
            // 4. Today's Challenge
            supabase.from('daily_challenges').select('*').eq('candidate_id', user.id).gte('created_at', today.toISOString()).maybeSingle(),
            // 5. Recent Events
            supabase.from('proof_events').select('*').eq('candidate_id', user.id).order('created_at', { ascending: false }).limit(20),
            // 6. 12w Grid (we aggregate in JS after fetch for simplicity, or use custom RPC)
            supabase.from('proof_events').select('created_at').eq('candidate_id', user.id).gte('created_at', new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString()),
            // 7. Top Matches
            supabase.from('candidate_matches').select('*, parsed_jds(*)').eq('candidate_id', user.id).is('dismissed_at', null).order('match_score', { ascending: false }).limit(3),
            // 8. Recent Interests
            supabase.from('recruiter_interest').select('*, parsed_jds(*)').eq('candidate_id', user.id).order('created_at', { ascending: false }).limit(3),
            // 9. 14d Score History
            supabase.from('proof_events').select('created_at, score_impact').eq('candidate_id', user.id).gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: true })
        ]);
        // Handle initial score and delta
        const currentScore = candidateRes.data?.pulse_score || 0;
        const weeklyDelta = deltaRes.data?.reduce((sum, e) => sum + (e.score_impact || 0), 0) || 0;
        // Process history for sparkline
        // We start from current score and work backwards
        let tempScore = currentScore;
        const historyMap = {};
        const eventsForHistory = [...(historyRes.data || [])].reverse();
        // Fill last 14 days
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().slice(0, 10);
            historyMap[dayStr] = tempScore;
            // Subtract impacts from this day
            const dayEvents = eventsForHistory.filter(e => e.created_at.startsWith(dayStr));
            dayEvents.forEach(e => { tempScore -= (e.score_impact || 0); });
        }
        // Process grid
        const gridMap = {};
        gridRes.data?.forEach(e => {
            const day = e.created_at.slice(0, 10);
            gridMap[day] = (gridMap[day] || 0) + 1;
        });
        res.json({
            candidate: candidateRes.data,
            streak: streakRes.data || { current_streak: 0, longest_streak: 0 },
            score: {
                current: currentScore,
                delta_7d: weeklyDelta,
                history_14d: Object.entries(historyMap).map(([day, val]) => ({ day, value: val })).reverse()
            },
            daily_challenge: challengeRes.data,
            proof_events_recent: eventsRes.data || [],
            proof_grid_12w: Object.entries(gridMap).map(([day, count]) => ({ day, count })),
            top_matches: matchesRes.data || [],
            recent_interests: interestsRes.data || []
        });
    }
    catch (err) {
        console.error('[GET /candidates/me/dashboard]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me ─────────────────────────────────────
// Returns the current candidate's profile from the candidates table.
meRouter.get('/', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
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
const updateProfileSchema = z.object({
    full_name: z.string().optional(),
    headline: z.string().optional(),
    experience_years: z.number().int().optional(),
    notice_period_days: z.number().int().optional(),
    skills: z.array(z.string()).optional(),
    github_verified: z.boolean().optional(),
    leetcode_verified: z.boolean().optional(),
    has_video_pitch: z.boolean().optional(),
    location: z.string().optional(),
    onboarding_step: z.number().int().optional(),
}).strict();
meRouter.put('/', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
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
meRouter.get('/views', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
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
// Returns candidate_matches joined with parsed_jds.
meRouter.get('/matches', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { saved } = req.query;
        let query = supabase
            .from('candidate_matches')
            .select('*, parsed_jds(*)')
            .eq('candidate_id', user.id)
            .is('dismissed_at', null);
        if (saved === 'true') {
            query = query.not('saved_at', 'is', null);
        }
        const { data, error } = await query.order('match_score', { ascending: false });
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
// ── GET /candidates/me/interests ───────────────────────────
// GET inbound recruiter signals (Who likes me?)
meRouter.get('/interests', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { status } = req.query;
        let query = supabase
            .from('recruiter_interest')
            .select('*, parsed_jds(*)')
            .eq('candidate_id', user.id);
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
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
// ── PUT /candidates/me/interests/:id/respond ───────────────
meRouter.put('/interests/:id/respond', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const { status } = req.body; // 'accepted' | 'declined'
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('recruiter_interest')
            .update({
            status,
            responded_at: new Date().toISOString()
        })
            .eq('id', id)
            .eq('candidate_id', user.id)
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
// ── PUT /candidates/me/matches/:id/save ────────────────────
meRouter.put('/matches/:id/save', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const { saved } = req.body; // boolean
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('candidate_matches')
            .update({ saved_at: saved ? new Date().toISOString() : null })
            .eq('id', id)
            .eq('candidate_id', user.id)
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
// ── PUT /candidates/me/matches/:id/dismiss ─────────────────
meRouter.put('/matches/:id/dismiss', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const supabase = getSupabase();
        const { error } = await supabase
            .from('candidate_matches')
            .update({ dismissed_at: new Date().toISOString() })
            .eq('id', id)
            .eq('candidate_id', user.id);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GET /candidates/me/streak ──────────────────────────────
// Returns the candidate's current streak info.
meRouter.get('/streak', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
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
meRouter.get('/challenge/today', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const todayStr = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        // 1. Check if challenge already exists for today
        const { data: existing, error: fetchError } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('candidate_id', user.id)
            .gte('created_at', `${todayStr}T00:00:00Z`)
            .lt('created_at', `${tomorrowStr}T00:00:00Z`)
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
// Marks today's challenge as completed and updates the streak.
const completeChallengeSchema = z.object({
    challenge_id: z.string().uuid(),
});
meRouter.post('/challenges/complete', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = completeChallengeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
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
            .maybeSingle();
        let newCurrent = 1;
        if (streak && streak.last_activity_date) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            if (streak.last_activity_date === yesterdayStr) {
                newCurrent = streak.current_streak + 1;
            }
            else if (streak.last_activity_date === todayStr) {
                newCurrent = streak.current_streak; // Already done today
            }
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
meRouter.get('/challenges', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
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
meRouter.get('/suggestions', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
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
const updateSuggestionSchema = z.object({
    status: z.enum(['accepted', 'dismissed']),
});
meRouter.put('/suggestions/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const parsed = updateSuggestionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
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
// ── POST /candidates/me/opportunities/recompute ─────────────
meRouter.post('/opportunities/recompute', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const COPILOT_SERVICE_URL = process.env.COPILOT_SERVICE_URL || 'http://copilot-service:3005';
        // 1. Fetch Candidate + Extras
        const [{ data: candidate }, { data: goals }, { data: repos }] = await Promise.all([
            supabase.from('candidates').select('*').eq('id', user.id).single(),
            supabase.from('candidate_goals').select('*').eq('candidate_id', user.id).maybeSingle(),
            supabase.from('github_repos').select('*').eq('candidate_id', user.id).limit(10)
        ]);
        if (!candidate) {
            res.status(404).json({ error: 'Candidate not found' });
            return;
        }
        // 2. Fetch last 50 JDs
        const { data: jds, error: jdsError } = await supabase
            .from('parsed_jds')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        if (jdsError) {
            res.status(500).json({ error: jdsError.message });
            return;
        }
        // 3. Batch Ranking via Copilot
        const payload = {
            candidate: {
                id: candidate.id,
                headline: candidate.headline || "",
                pulse_score: candidate.pulse_score || 0,
                experience_years: candidate.experience_years || 0,
                notice_period_days: candidate.notice_period_days || 30,
                skills: candidate.skills || [],
                github_verified: candidate.github_verified || false,
                leetcode_verified: candidate.leetcode_verified || false,
                has_video_pitch: candidate.has_video_pitch || false,
                location: candidate.location || ""
            },
            candidate_goals: goals,
            github_repos: (repos || []).map(r => ({
                repo_name: r.repo_name,
                stars: r.stars,
                inferred_skills: r.inferred_skills
            })),
            parsed_jds: jds
        };
        const copRes = await fetch(`${COPILOT_SERVICE_URL}/copilot/rank-opportunities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!copRes.ok)
            throw new Error('Copilot ranking failed');
        const rankedData = (await copRes.json()).ranked;
        const matchesToUpsert = rankedData
            .filter((r) => r.match_score >= 60)
            .map((r) => ({
            candidate_id: user.id,
            jd_id: r.jd_id,
            match_score: r.match_score,
            matched_skills: r.matched_skills,
            missing_skills: r.missing_skills,
            why_you: r.why_you,
            growth_opportunity: r.growth_opportunity,
            updated_at: new Date().toISOString()
        }));
        if (matchesToUpsert.length > 0) {
            await supabase
                .from('candidate_matches')
                .upsert(matchesToUpsert, { onConflict: 'candidate_id,jd_id' });
        }
        res.json({ success: true, matches_found: matchesToUpsert.length });
    }
    catch (err) {
        console.error('[POST /candidates/me/opportunities/recompute]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates/me/interests ──────────────────────────
// Express Interest: Candidate -> Recruiter application
meRouter.post('/interests', async (req, res) => {
    try {
        const user = getUser(req);
        const { jd_id, message } = req.body;
        const supabase = getSupabase();
        // 1. Find recruiter_id for this JD
        const { data: jd, error: jdError } = await supabase
            .from('parsed_jds')
            .select('recruiter_id')
            .eq('id', jd_id)
            .single();
        if (jdError || !jd) {
            res.status(404).json({ error: 'Job description not found' });
            return;
        }
        // 2. Insert into candidate_interest (application)
        const { data, error } = await supabase
            .from('candidate_interest')
            .insert({
            candidate_id: user.id,
            recruiter_id: jd.recruiter_id || '00000000-0000-0000-0000-000000000000', // fallback if not field yet
            jd_id,
            message,
            status: 'pending'
        })
            .select()
            .single();
        if (error) {
            // Handle unique constraint if they already applied
            if (error.code === '23505') {
                res.status(409).json({ error: 'Already applied' });
                return;
            }
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── PUT /candidates/me/goals ───────────────────────────────
const upsertGoalsSchema = z.object({
    target_roles: z.array(z.string()),
    target_locations: z.array(z.string()),
    comp_min: z.number().int().optional(),
    comp_max: z.number().int().optional(),
    comp_currency: z.string().default('INR'),
    notice_period_days: z.number().int().optional(),
    what_learning: z.array(z.string()),
});
meRouter.put('/goals', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = upsertGoalsSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('candidate_goals')
            .upsert({
            candidate_id: user.id,
            ...parsed.data,
            updated_at: new Date().toISOString()
        }, { onConflict: 'candidate_id' })
            .select()
            .single();
        if (error) {
            console.error('[PUT /candidates/me/goals]', error);
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error('[PUT /candidates/me/goals]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates/me/github/scan ────────────────────────
const githubScanSchema = z.object({
    username: z.string(),
});
meRouter.post('/github/scan', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = githubScanSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Username required' });
            return;
        }
        const { username } = parsed.data;
        // v1: Use unauthenticated GitHub API (limited to 60 requests/hr)
        // In production, we would use the candidate's GitHub OAuth token.
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        if (!reposRes.ok) {
            res.status(404).json({ error: 'GitHub user not found or API limit reached' });
            return;
        }
        const githubRepos = (await reposRes.json());
        const inferredSkills = new Set();
        const processedRepos = await Promise.all(githubRepos.map(async (repo) => {
            // Fetch languages
            const langRes = await fetch(repo.languages_url);
            const languages = langRes.ok ? await langRes.json() : {};
            Object.keys(languages).forEach(l => inferredSkills.add(l));
            // Fetch README snippet (first 1000 chars)
            const readmeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
                headers: { Accept: 'application/vnd.github.v3.raw' }
            });
            const readme = readmeRes.ok ? await readmeRes.text() : '';
            return {
                candidate_id: user.id,
                repo_url: repo.html_url,
                repo_name: repo.name,
                stars: repo.stargazers_count,
                inferred_skills: Object.keys(languages),
                ai_generated_readme: readme.slice(0, 1000),
                last_synced_at: new Date().toISOString()
            };
        }));
        // Batch insert into github_repos
        const supabase = getSupabase();
        const { error: insertError } = await supabase
            .from('github_repos')
            .upsert(processedRepos, { onConflict: 'candidate_id,repo_url' });
        if (insertError) {
            console.error('[POST /github/scan] insert error:', insertError);
        }
        res.json({
            repos: processedRepos,
            inferred_skills: Array.from(inferredSkills)
        });
    }
    catch (err) {
        console.error('[POST /candidates/me/github/scan]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── POST /candidates/me/storage/sign ───────────────────────
const storageSignSchema = z.object({
    bucket: z.enum(['video-pitches', 'case-study-files', 'profile-avatars']),
    file_name: z.string(),
    content_type: z.string().optional(),
});
meRouter.post('/storage/sign', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = storageSignSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid storage request' });
            return;
        }
        const { bucket, file_name } = parsed.data;
        const supabase = getSupabase();
        // Path includes user ID for RLS enforcement
        const filePath = `${user.id}/${file_name}`;
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600); // 1 hour validity
        if (error) {
            console.error('[POST /storage/sign]', error);
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ signedUrl: data.signedUrl, path: filePath });
    }
    catch (err) {
        console.error('[POST /candidates/me/storage/sign]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── GitHub Repos ──────────────────────────────────────────
meRouter.get('/github-repos', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('github_repos')
            .select('*')
            .eq('candidate_id', user.id)
            .order('stars', { ascending: false });
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
meRouter.put('/github-repos/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const { is_featured, ai_generated_readme } = req.body;
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('github_repos')
            .update({ is_featured, ai_generated_readme })
            .eq('id', id)
            .eq('candidate_id', user.id)
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        // Emit event if README was generated or featured was toggled
        if (ai_generated_readme || is_featured !== undefined) {
            await emitProofEvent(user.id, 'readme_generated', { repo_id: id }, is_featured ? 3 : 0);
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Case Studies ──────────────────────────────────────────
meRouter.get('/case-studies', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('case_studies')
            .select('*')
            .eq('candidate_id', user.id)
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
meRouter.post('/case-studies', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('case_studies')
            .insert({ ...req.body, candidate_id: user.id })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await emitProofEvent(user.id, 'case_study_added', { study_id: data.id }, 5);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
meRouter.delete('/case-studies/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const supabase = getSupabase();
        const { error } = await supabase
            .from('case_studies')
            .delete()
            .eq('id', id)
            .eq('candidate_id', user.id);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await recalculatePulseScore(user.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Mock Interviews ───────────────────────────────────────
meRouter.get('/mock-interviews', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('mock_interviews')
            .select('*')
            .eq('candidate_id', user.id)
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
meRouter.post('/mock-interviews', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('mock_interviews')
            .insert({ ...req.body, candidate_id: user.id })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await emitProofEvent(user.id, 'mock_interview_completed', { interview_id: data.id }, 0);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
meRouter.put('/mock-interviews/:id/share', async (req, res) => {
    try {
        const user = getUser(req);
        const { id } = req.params;
        const token = Math.random().toString(36).substring(2, 15);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('mock_interviews')
            .update({ shareable_token: token })
            .eq('id', id)
            .eq('candidate_id', user.id)
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
// ── Skill Assessments ─────────────────────────────────────
meRouter.get('/skill-assessments', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('skill_assessments')
            .select('*')
            .eq('candidate_id', user.id)
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
meRouter.post('/skill-assessments', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('skill_assessments')
            .insert({ ...req.body, candidate_id: user.id })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        if (data.score >= 70) {
            await emitProofEvent(user.id, 'skill_assessment_passed', { skill: data.skill, score: data.score }, 5);
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ── Video Pitch ───────────────────────────────────────────
meRouter.get('/video-pitch', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('video_pitches')
            .select('*')
            .eq('candidate_id', user.id)
            .maybeSingle();
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
meRouter.post('/video-pitch', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('video_pitches')
            .upsert({ ...req.body, candidate_id: user.id }, { onConflict: 'candidate_id' })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await emitProofEvent(user.id, 'video_pitch_added', { video_url: data.video_url }, 10);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=me.js.map