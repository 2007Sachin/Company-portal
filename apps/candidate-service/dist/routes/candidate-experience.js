import { Router } from 'express';
import { z } from 'zod';
import { verifyToken } from '@pulse/shared-utils';
import { getSupabase } from '../lib/supabase.js';
import { buildScoreBreakdownFromContext, buildScoreCoach, buildVisibilitySummary, computeMatchesForCandidate, fetchCandidateContext, getOrCreateDailyChallenge, getTrustTier, listActivityFeed, recalculatePulseScoreV2, recordActivityEvent, } from '../lib/candidate-cockpit.js';
export const candidateExperienceRouter = Router();
candidateExperienceRouter.use(verifyToken);
function getUser(req) {
    return req.user;
}
async function callCopilot(path, body) {
    const baseUrl = process.env.COPILOT_SERVICE_URL || 'http://copilot-service:3005';
    const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Copilot request failed: ${detail}`);
    }
    return response.json();
}
function heuristicAnswerFeedback(question, answer) {
    const answerWords = answer.trim().split(/\s+/).filter(Boolean);
    const questionKeywords = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 4);
    const hits = questionKeywords.filter((keyword) => answer.toLowerCase().includes(keyword)).length;
    let score = Math.min(10, Math.max(1, Math.round(answerWords.length / 20) + hits));
    if (answerWords.length < 25)
        score = Math.min(score, 5);
    const feedback = score >= 8
        ? 'Strong structure and relevant detail. Tighten one example to make the answer even more recruiter-ready.'
        : score >= 6
            ? 'Solid start. Add more implementation detail, trade-offs, and a concrete example from your own work.'
            : 'The answer is too short or too generic. Try using a clearer structure: context, approach, decisions, and result.';
    return {
        score,
        feedback,
    };
}
candidateExperienceRouter.get('/visibility', async (req, res) => {
    try {
        const summary = await buildVisibilitySummary(getUser(req).id);
        res.json(summary);
    }
    catch (error) {
        console.error('[GET /candidates/visibility]', error);
        res.status(500).json({ error: 'Failed to load visibility insights' });
    }
});
candidateExperienceRouter.get('/activity-feed', async (req, res) => {
    try {
        const events = await listActivityFeed(getUser(req).id, 10);
        res.json({ events });
    }
    catch (error) {
        console.error('[GET /candidates/activity-feed]', error);
        res.status(500).json({ error: 'Failed to load activity feed' });
    }
});
candidateExperienceRouter.get('/score/breakdown', async (req, res) => {
    try {
        const context = await fetchCandidateContext(getUser(req).id);
        const score = buildScoreBreakdownFromContext(context);
        const coach = buildScoreCoach(context);
        res.json({
            score: score.overall,
            tier: score.tier,
            breakdown: score.breakdown,
            coach_actions: coach,
        });
    }
    catch (error) {
        console.error('[GET /candidates/score/breakdown]', error);
        res.status(500).json({ error: 'Failed to load score breakdown' });
    }
});
candidateExperienceRouter.post('/score/recalculate', async (req, res) => {
    try {
        const score = await recalculatePulseScoreV2(getUser(req).id);
        res.json(score);
    }
    catch (error) {
        console.error('[POST /candidates/score/recalculate]', error);
        res.status(500).json({ error: 'Failed to recalculate score' });
    }
});
candidateExperienceRouter.post('/matches/compute', async (req, res) => {
    try {
        const matches = await computeMatchesForCandidate(getUser(req).id);
        res.json({ matches });
    }
    catch (error) {
        console.error('[POST /candidates/matches/compute]', error);
        res.status(500).json({ error: 'Failed to compute matches' });
    }
});
candidateExperienceRouter.get('/matches', async (req, res) => {
    try {
        const user = getUser(req);
        const supabase = getSupabase();
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const saved = req.query.saved === 'true';
        let query = supabase
            .from('candidate_matches')
            .select('*, parsed_jds(*)')
            .eq('candidate_id', user.id)
            .order('match_score', { ascending: false });
        if (status)
            query = query.eq('status', status);
        if (saved)
            query = query.not('saved_at', 'is', null);
        const { data, error } = await query;
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ matches: data ?? [] });
    }
    catch (error) {
        console.error('[GET /candidates/matches]', error);
        res.status(500).json({ error: 'Failed to load matches' });
    }
});
const updateMatchSchema = z.object({
    status: z.enum(['new', 'seen', 'interested', 'dismissed', 'engaged']).optional(),
    saved: z.boolean().optional(),
});
candidateExperienceRouter.patch('/matches/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = updateMatchSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const payload = {
            updated_at: new Date().toISOString(),
        };
        if (parsed.data.status)
            payload.status = parsed.data.status;
        if (typeof parsed.data.saved === 'boolean')
            payload.saved_at = parsed.data.saved ? new Date().toISOString() : null;
        if (parsed.data.status === 'dismissed')
            payload.dismissed_at = new Date().toISOString();
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('candidate_matches')
            .update(payload)
            .eq('id', req.params.id)
            .eq('candidate_id', user.id)
            .select('*, parsed_jds(*)')
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        if (parsed.data.status) {
            await recordActivityEvent(user.id, 'match_updated', {
                match_id: req.params.id,
                status: parsed.data.status,
            });
        }
        res.json(data);
    }
    catch (error) {
        console.error('[PATCH /candidates/matches/:id]', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
});
const expressInterestSchema = z.object({
    intro_message: z.string().min(1).max(1200),
});
candidateExperienceRouter.post('/matches/:id/express', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = expressInterestSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
        const { data: match, error: matchError } = await supabase
            .from('candidate_matches')
            .select('*, parsed_jds(*)')
            .eq('id', req.params.id)
            .eq('candidate_id', user.id)
            .single();
        if (matchError || !match) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        const jd = match.parsed_jds;
        const recruiterId = jd?.recruiter_id;
        if (!recruiterId) {
            res.status(400).json({ error: 'This role is not yet linked to a recruiter' });
            return;
        }
        await supabase
            .from('candidate_matches')
            .update({
            status: 'interested',
            candidate_intro_message: parsed.data.intro_message,
            updated_at: new Date().toISOString(),
        })
            .eq('id', req.params.id)
            .eq('candidate_id', user.id);
        const interestInsert = await supabase
            .from('candidate_interest')
            .upsert({
            candidate_id: user.id,
            recruiter_id: recruiterId,
            jd_id: jd.id,
            message: parsed.data.intro_message,
            status: 'pending',
        }, {
            onConflict: 'candidate_id,jd_id',
        })
            .select()
            .single();
        if (interestInsert.error) {
            res.status(400).json({ error: interestInsert.error.message });
            return;
        }
        await supabase
            .from('pipeline')
            .upsert({
            candidate_id: user.id,
            recruiter_id: recruiterId,
            stage: 'pending',
            notes: parsed.data.intro_message,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'candidate_id,recruiter_id',
        });
        await recordActivityEvent(user.id, 'interest_sent', {
            parsed_jd_id: jd.id,
            role_title: jd.role_title,
            status: 'candidate_interested',
        });
        res.json({
            success: true,
            interest: interestInsert.data,
        });
    }
    catch (error) {
        console.error('[POST /candidates/matches/:id/express]', error);
        res.status(500).json({ error: 'Failed to express interest' });
    }
});
candidateExperienceRouter.post('/agents/profile-optimize', async (req, res) => {
    try {
        const user = getUser(req);
        const context = await fetchCandidateContext(user.id);
        const candidate = context.candidate ?? {};
        const result = await callCopilot('/copilot/optimize-profile', {
            headline: candidate.headline || '',
            skills: candidate.skills || [],
            experience_years: candidate.experience_years || 0,
            github_verified: candidate.github_verified || false,
            leetcode_verified: candidate.leetcode_verified || false,
            has_video_pitch: candidate.has_video_pitch || false,
        });
        await getSupabase().from('agent_actions').insert({
            candidate_id: user.id,
            agent_type: 'profile_optimizer',
            action_data: result,
            status: 'completed',
        });
        await recordActivityEvent(user.id, 'agent_action', {
            agent_type: 'profile_optimizer',
            summary: 'Profile optimization suggestions ready',
        });
        res.json(result);
    }
    catch (error) {
        console.error('[POST /candidates/agents/profile-optimize]', error);
        res.status(500).json({ error: 'Failed to run profile optimizer' });
    }
});
candidateExperienceRouter.post('/agents/github-curate', async (req, res) => {
    try {
        const user = getUser(req);
        const context = await fetchCandidateContext(user.id);
        const repos = [...(context.repos ?? [])];
        const targetRoles = new Set((context.goals?.target_roles ?? []).map((role) => role.toLowerCase()));
        const curated = repos
            .map((repo) => {
            const repoSkills = (repo.inferred_skills ?? []).map((skill) => String(skill).toLowerCase());
            const relevance = repoSkills.some((skill) => Array.from(targetRoles).some((role) => role.includes(skill))) ? 20 : 0;
            const score = Number(repo.stars || 0) * 2 + Number(repo.commit_count_30d || 0) + relevance;
            return {
                ...repo,
                relevance_score: score,
                suggested_summary: `${repo.repo_name} is a ${repoSkills.slice(0, 3).join(', ')} project with recent activity and recruiter-facing relevance for ${context.goals?.target_roles?.[0] || 'your target roles'}.`,
            };
        })
            .sort((left, right) => right.relevance_score - left.relevance_score)
            .slice(0, 3);
        await getSupabase().from('agent_actions').insert({
            candidate_id: user.id,
            agent_type: 'github_curator',
            action_data: { curated },
            status: 'completed',
        });
        await recordActivityEvent(user.id, 'agent_action', {
            agent_type: 'github_curator',
            curated_repo_count: curated.length,
        });
        res.json({ curated });
    }
    catch (error) {
        console.error('[POST /candidates/agents/github-curate]', error);
        res.status(500).json({ error: 'Failed to run GitHub curator' });
    }
});
const startInterviewSchema = z.object({
    target_role: z.string().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    format: z.enum(['technical', 'behavioral', 'system_design', 'mixed']),
});
candidateExperienceRouter.post('/agents/mock-interview', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = startInterviewSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const context = await fetchCandidateContext(user.id);
        const questionsResponse = await callCopilot('/copilot/mock-interview', {
            skills: context.candidate?.skills || [],
            role_title: parsed.data.target_role,
            difficulty: parsed.data.difficulty,
        });
        const questions = (questionsResponse.questions || []).slice(0, 5).map((question, index) => ({
            id: `q_${index + 1}`,
            question: question.question,
            category: question.category,
            hints: question.hints || [],
            ideal_answer_points: question.ideal_answer_points || [],
            answer: '',
            score: null,
            feedback: '',
        }));
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('mock_interviews')
            .insert({
            candidate_id: user.id,
            target_role: parsed.data.target_role,
            difficulty: parsed.data.difficulty,
            format: parsed.data.format,
            questions: questions,
            questions_v2: questions,
            duration_seconds: 0,
        })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await getSupabase().from('agent_actions').insert({
            candidate_id: user.id,
            agent_type: 'mock_interview',
            action_data: { interview_id: data.id, target_role: parsed.data.target_role },
            status: 'running',
        });
        res.json({
            interview_id: data.id,
            target_role: parsed.data.target_role,
            difficulty: parsed.data.difficulty,
            format: parsed.data.format,
            total_questions: questions.length,
            next_question: questions[0],
        });
    }
    catch (error) {
        console.error('[POST /candidates/agents/mock-interview]', error);
        res.status(500).json({ error: 'Failed to start mock interview' });
    }
});
const answerInterviewSchema = z.object({
    question_index: z.number().int().min(0).max(4),
    answer: z.string().min(1),
    elapsed_seconds: z.number().int().min(0).optional(),
});
candidateExperienceRouter.post('/agents/mock-interview/:id/answer', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = answerInterviewSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
        const { data: interview, error } = await supabase
            .from('mock_interviews')
            .select('*')
            .eq('id', req.params.id)
            .eq('candidate_id', user.id)
            .single();
        if (error || !interview) {
            res.status(404).json({ error: 'Interview not found' });
            return;
        }
        const questions = (interview.questions_v2 || interview.questions || []);
        const currentQuestion = questions[parsed.data.question_index];
        if (!currentQuestion) {
            res.status(400).json({ error: 'Question index out of range' });
            return;
        }
        const graded = heuristicAnswerFeedback(currentQuestion.question, parsed.data.answer);
        questions[parsed.data.question_index] = {
            ...currentQuestion,
            answer: parsed.data.answer,
            score: graded.score,
            feedback: graded.feedback,
        };
        const answered = questions.filter((question) => question.answer).length;
        const isComplete = answered === questions.length;
        const scores = questions.map((question) => Number(question.score || 0)).filter(Boolean);
        const overallScore = scores.length > 0 ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null;
        const strengths = questions
            .filter((question) => Number(question.score || 0) >= 8)
            .slice(0, 3)
            .map((question) => `${question.category}: clear, structured answer`);
        const improvements = questions
            .filter((question) => Number(question.score || 0) < 8)
            .slice(0, 3)
            .map((question) => `${question.category}: add more implementation detail`);
        const { data: updated, error: updateError } = await supabase
            .from('mock_interviews')
            .update({
            questions: questions,
            questions_v2: questions,
            overall_score: overallScore,
            strengths,
            improvements,
            duration_seconds: Number(interview.duration_seconds || 0) + Number(parsed.data.elapsed_seconds || 0),
            target_role: interview.target_role,
        })
            .eq('id', req.params.id)
            .eq('candidate_id', user.id)
            .select()
            .single();
        if (updateError) {
            res.status(400).json({ error: updateError.message });
            return;
        }
        if (isComplete) {
            await getSupabase().from('agent_actions').insert({
                candidate_id: user.id,
                agent_type: 'mock_interview',
                action_data: {
                    interview_id: req.params.id,
                    overall_score: overallScore,
                },
                status: 'completed',
            });
            await recordActivityEvent(user.id, 'agent_action', {
                agent_type: 'mock_interview',
                overall_score: overallScore,
            });
        }
        res.json({
            interview_id: updated.id,
            graded_question: questions[parsed.data.question_index],
            complete: isComplete,
            overall_score: overallScore,
            strengths,
            improvements,
            next_question: isComplete ? null : questions[parsed.data.question_index + 1],
        });
    }
    catch (error) {
        console.error('[POST /candidates/agents/mock-interview/:id/answer]', error);
        res.status(500).json({ error: 'Failed to submit mock interview answer' });
    }
});
candidateExperienceRouter.get('/agents/mock-interview/history', async (req, res) => {
    try {
        const { data, error } = await getSupabase()
            .from('mock_interviews')
            .select('*')
            .eq('candidate_id', getUser(req).id)
            .order('created_at', { ascending: false });
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ interviews: data ?? [] });
    }
    catch (error) {
        console.error('[GET /candidates/agents/mock-interview/history]', error);
        res.status(500).json({ error: 'Failed to load interview history' });
    }
});
candidateExperienceRouter.get('/challenges/today', async (req, res) => {
    try {
        const challenge = await getOrCreateDailyChallenge(getUser(req).id);
        res.json(challenge);
    }
    catch (error) {
        console.error('[GET /candidates/challenges/today]', error);
        res.status(500).json({ error: 'Failed to load today challenge' });
    }
});
const completeChallengeSchema = z.object({
    challenge_id: z.string().uuid(),
});
candidateExperienceRouter.post('/challenges/complete', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = completeChallengeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const supabase = getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const { data: challenge, error } = await supabase
            .from('daily_challenges')
            .update({
            completed: true,
            completed_at: new Date().toISOString(),
        })
            .eq('id', parsed.data.challenge_id)
            .eq('candidate_id', user.id)
            .select()
            .single();
        if (error || !challenge) {
            res.status(404).json({ error: 'Challenge not found' });
            return;
        }
        const { data: streak } = await supabase
            .from('candidate_streaks')
            .select('*')
            .eq('candidate_id', user.id)
            .maybeSingle();
        let currentStreak = 1;
        if (streak?.last_completed_date) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayIso = yesterday.toISOString().slice(0, 10);
            if (streak.last_completed_date === yesterdayIso)
                currentStreak = Number(streak.current_streak || 0) + 1;
            if (streak.last_completed_date === today)
                currentStreak = Number(streak.current_streak || 0);
        }
        const longestStreak = Math.max(currentStreak, Number(streak?.longest_streak || 0));
        const totalCompleted = Number(streak?.total_completed || 0) + 1;
        const { data: updatedStreak } = await supabase
            .from('candidate_streaks')
            .upsert({
            candidate_id: user.id,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            total_completed: totalCompleted,
            last_completed_date: today,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'candidate_id',
        })
            .select()
            .single();
        await recordActivityEvent(user.id, 'challenge_completed', {
            challenge_id: parsed.data.challenge_id,
            current_streak: updatedStreak?.current_streak ?? currentStreak,
            longest_streak: updatedStreak?.longest_streak ?? longestStreak,
        });
        res.json({
            challenge,
            streak: updatedStreak,
        });
    }
    catch (error) {
        console.error('[POST /candidates/challenges/complete]', error);
        res.status(500).json({ error: 'Failed to complete challenge' });
    }
});
candidateExperienceRouter.get('/streak', async (req, res) => {
    try {
        const { data, error } = await getSupabase()
            .from('candidate_streaks')
            .select('*')
            .eq('candidate_id', getUser(req).id)
            .maybeSingle();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json(data ?? {
            current_streak: 0,
            longest_streak: 0,
            total_completed: 0,
            last_completed_date: null,
        });
    }
    catch (error) {
        console.error('[GET /candidates/streak]', error);
        res.status(500).json({ error: 'Failed to load streak' });
    }
});
const caseStudySchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    file_url: z.string().url().optional(),
    external_url: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
});
candidateExperienceRouter.post('/case-studies', async (req, res) => {
    try {
        const user = getUser(req);
        const parsed = caseStudySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const { data, error } = await getSupabase()
            .from('case_studies')
            .insert({
            candidate_id: user.id,
            title: parsed.data.title,
            description: parsed.data.description || '',
            file_url: parsed.data.file_url,
            external_url: parsed.data.external_url,
            tags: parsed.data.tags || [],
        })
            .select()
            .single();
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await recordActivityEvent(user.id, 'case_study_added', {
            case_study_id: data.id,
            title: data.title,
        });
        await recalculatePulseScoreV2(user.id);
        res.json(data);
    }
    catch (error) {
        console.error('[POST /candidates/case-studies]', error);
        res.status(500).json({ error: 'Failed to create case study' });
    }
});
candidateExperienceRouter.get('/case-studies', async (req, res) => {
    try {
        const { data, error } = await getSupabase()
            .from('case_studies')
            .select('*')
            .eq('candidate_id', getUser(req).id)
            .order('created_at', { ascending: false });
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        res.json({ case_studies: data ?? [] });
    }
    catch (error) {
        console.error('[GET /candidates/case-studies]', error);
        res.status(500).json({ error: 'Failed to load case studies' });
    }
});
candidateExperienceRouter.delete('/case-studies/:id', async (req, res) => {
    try {
        const user = getUser(req);
        const { error } = await getSupabase()
            .from('case_studies')
            .delete()
            .eq('id', req.params.id)
            .eq('candidate_id', user.id);
        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }
        await recalculatePulseScoreV2(user.id);
        res.json({ success: true });
    }
    catch (error) {
        console.error('[DELETE /candidates/case-studies/:id]', error);
        res.status(500).json({ error: 'Failed to delete case study' });
    }
});
candidateExperienceRouter.get('/profile/public/:username', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data: candidate, error } = await supabase
            .from('candidates')
            .select('*')
            .ilike('username', req.params.username)
            .single();
        if (error || !candidate) {
            res.status(404).json({ error: 'Public profile not found' });
            return;
        }
        const context = await fetchCandidateContext(candidate.id);
        const score = buildScoreBreakdownFromContext(context);
        if (candidate.profile_visibility === 'hidden') {
            res.status(403).json({ error: 'This profile is hidden' });
            return;
        }
        const featuredRepos = (context.repos ?? [])
            .sort((left, right) => Number(right.is_featured) - Number(left.is_featured))
            .slice(0, 6);
        res.json({
            profile: {
                username: candidate.username,
                full_name: candidate.full_name,
                headline: candidate.headline,
                city: candidate.city || candidate.location,
                college_name: candidate.college_name,
                graduation_year: candidate.graduation_year,
                profile_photo_url: candidate.profile_photo_url,
                target_roles: context.goals?.target_roles || [],
                skills: candidate.skills || [],
                allow_recruiter_contact: candidate.allow_recruiter_contact,
            },
            pulse_score: {
                score: score.overall,
                tier: getTrustTier(score.overall),
                breakdown: score.breakdown,
            },
            featured_repos: featuredRepos,
            case_studies: context.caseStudies ?? [],
            video_pitch: context.videoPitch ? {
                video_url: context.videoPitch.video_url,
                transcript: context.videoPitch.transcript,
            } : null,
            streak: context.streak ?? {
                current_streak: 0,
                longest_streak: 0,
                total_completed: 0,
            },
        });
    }
    catch (error) {
        console.error('[GET /candidates/profile/public/:username]', error);
        res.status(500).json({ error: 'Failed to load public profile' });
    }
});
//# sourceMappingURL=candidate-experience.js.map