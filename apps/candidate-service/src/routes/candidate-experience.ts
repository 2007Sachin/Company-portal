import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyToken, AuthUser } from '@pulse/shared-utils';
import { getSupabase } from '../lib/supabase.js';
import {
  buildScoreBreakdownFromContext,
  buildScoreCoach,
  buildVisibilitySummary,
  computeMatchesForCandidate,
  fetchCandidateContext,
  getOrCreateDailyChallenge,
  getTrustTier,
  listActivityFeed,
  recalculatePulseScoreV2,
  recordActivityEvent,
} from '../lib/candidate-cockpit.js';
import { runAgentCycle } from '../lib/agent-loop.js';

export const candidateExperienceRouter = Router();
candidateExperienceRouter.use(verifyToken);

function getUser(req: Request): AuthUser {
  return (req as any).user as AuthUser;
}

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  headline: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  college_name: z.string().optional(),
  graduation_year: z.number().int().optional(),
  experience_years: z.number().int().optional(),
  skills: z.array(z.string()).optional(),
  profile_photo_url: z.string().optional(),
  github_username: z.string().optional(),
  leetcode_username: z.string().optional(),
  onboarding_step: z.number().int().optional(),
  profile_visibility: z.enum(['public', 'private', 'hidden']).optional(),
  data_consent: z.boolean().optional(),
}).strict();

const updateGoalsSchema = z.object({
  target_roles: z.array(z.string()),
  target_locations: z.array(z.string()),
  expected_ctc_min: z.number().int().optional(),
  expected_ctc_max: z.number().int().optional(),
  expected_ctc_currency: z.string().default('INR'),
  notice_period_days: z.number().int().optional(),
  preferred_company_types: z.array(z.string()).optional(),
  preferred_work_setup: z.array(z.string()).optional(),
}).strict();

const storageSignSchema = z.object({
  bucket: z.enum(['profile-photos', 'video-pitches', 'case-studies']),
  file_name: z.string(),
  content_type: z.string().optional(),
});

const updateAgentPreferencesSchema = z.object({
  autopilot_enabled: z.boolean().optional(),
  intro_style: z.enum(['aggressive', 'balanced', 'subtle']).optional(),
  target_match_score: z.number().int().min(0).max(100).optional(),
  notifications_enabled: z.boolean().optional(),
});

const jobSearchSchema = z.object({
  query: z.string().min(1),
  context: z.array(z.string()).optional(),
});

const applyRequestSchema = z.object({
  intro_text: z.string().optional(),
  use_autopilot: z.boolean().optional(),
});

async function callCopilot<T>(path: string, body: Record<string, any>): Promise<T> {
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

  return response.json() as Promise<T>;
}

function heuristicAnswerFeedback(question: string, answer: string) {
  const answerWords = answer.trim().split(/\s+/).filter(Boolean);
  const questionKeywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const hits = questionKeywords.filter((keyword) => answer.toLowerCase().includes(keyword)).length;

  let score = Math.min(10, Math.max(1, Math.round(answerWords.length / 20) + hits));
  if (answerWords.length < 25) score = Math.min(score, 5);

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

candidateExperienceRouter.get('/visibility', async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await buildVisibilitySummary(getUser(req).id);
    res.json(summary);
  } catch (error) {
    console.error('[GET /candidates/visibility]', error);
    res.status(500).json({ error: 'Failed to load visibility insights' });
  }
});

candidateExperienceRouter.get('/activity-feed', async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await listActivityFeed(getUser(req).id, 10);
    res.json({ events });
  } catch (error) {
    console.error('[GET /candidates/activity-feed]', error);
    res.status(500).json({ error: 'Failed to load activity feed' });
  }
});

candidateExperienceRouter.get('/score/breakdown', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[GET /candidates/score/breakdown]', error);
    res.status(500).json({ error: 'Failed to load score breakdown' });
  }
});

candidateExperienceRouter.post('/score/recalculate', async (req: Request, res: Response): Promise<void> => {
  try {
    const score = await recalculatePulseScoreV2(getUser(req).id);
    res.json(score);
  } catch (error) {
    console.error('[POST /candidates/score/recalculate]', error);
    res.status(500).json({ error: 'Failed to recalculate score' });
  }
});

candidateExperienceRouter.post('/matches/compute', async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await computeMatchesForCandidate(getUser(req).id);
    res.json({ matches });
  } catch (error) {
    console.error('[POST /candidates/matches/compute]', error);
    res.status(500).json({ error: 'Failed to compute matches' });
  }
});

candidateExperienceRouter.get('/matches', async (req: Request, res: Response): Promise<void> => {
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

    if (status) query = query.eq('status', status);
    if (saved) query = query.not('saved_at', 'is', null);

    const { data, error } = await query;
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ matches: data ?? [] });
  } catch (error) {
    console.error('[GET /candidates/matches]', error);
    res.status(500).json({ error: 'Failed to load matches' });
  }
});

candidateExperienceRouter.put('/', async (req: Request, res: Response): Promise<void> => {
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
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    await recalculatePulseScoreV2(user.id);
    res.json(data);
  } catch (error) {
    console.error('[PUT /candidates/]', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

candidateExperienceRouter.put('/goals', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = updateGoalsSchema.safeParse(req.body);
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
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'candidate_id',
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    await recalculatePulseScoreV2(user.id);
    res.json(data);
  } catch (error) {
    console.error('[PUT /candidates/goals]', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

candidateExperienceRouter.post('/storage/sign', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = storageSignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(parsed.data.bucket)
      .createSignedUrl(parsed.data.file_name, 600, {
        upsert: true,
      });

    if (error) {
       // If createSignedUrl fails because file doesn't exist yet but we want to upload, 
       // traditionally we might need a signed upload URL. 
       // In Supabase, if we want to UPLOAD, we should use createSignedUploadUrl if available or just use generic credentials if internal.
       // However, often we use getSignedUrl for downloads.
       // For UPLOADS, we use createSignedUploadUrl.
    }

    // Checking if createSignedUploadUrl exists in this version of Supabase client
    const { data: uploadData, error: uploadError } = await (supabase.storage.from(parsed.data.bucket) as any)
      .createSignedUploadUrl(parsed.data.file_name);

    if (uploadError) {
      res.status(400).json({ error: uploadError.message });
      return;
    }

    res.json(uploadData);
  } catch (error) {
    console.error('[POST /candidates/storage/sign]', error);
    res.status(500).json({ error: 'Failed to generate signed upload URL' });
  }
});

const updateMatchSchema = z.object({
  status: z.enum(['new', 'seen', 'interested', 'dismissed', 'engaged']).optional(),
  saved: z.boolean().optional(),
});

candidateExperienceRouter.patch('/matches/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = updateMatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.status) payload.status = parsed.data.status;
    if (typeof parsed.data.saved === 'boolean') payload.saved_at = parsed.data.saved ? new Date().toISOString() : null;
    if (parsed.data.status === 'dismissed') payload.dismissed_at = new Date().toISOString();

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
  } catch (error) {
    console.error('[PATCH /candidates/matches/:id]', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

const expressInterestSchema = z.object({
  intro_message: z.string().min(1).max(1200),
});

candidateExperienceRouter.post('/matches/:id/express', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[POST /candidates/matches/:id/express]', error);
    res.status(500).json({ error: 'Failed to express interest' });
  }
});

candidateExperienceRouter.post('/agents/profile-optimize', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const context = await fetchCandidateContext(user.id);
    const dbCandidate = context.candidate ?? {};
    
    // Allow partial data from body for real-time onboarding suggestions
    const body = req.body || {};
    
    const result = await callCopilot<any>('/copilot/optimize-profile', {
      headline: body.headline || dbCandidate.headline || '',
      skills: body.skills || dbCandidate.skills || [],
      experience_years: body.experience_years ?? dbCandidate.experience_years ?? 0,
      github_verified: body.github_verified ?? dbCandidate.github_verified ?? false,
      leetcode_verified: body.leetcode_verified ?? dbCandidate.leetcode_verified ?? false,
      has_video_pitch: body.has_video_pitch ?? dbCandidate.has_video_pitch ?? false,
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
  } catch (error) {
    console.error('[POST /candidates/agents/profile-optimize]', error);
    res.status(500).json({ error: 'Failed to run profile optimizer' });
  }
});

candidateExperienceRouter.post('/agents/github-curate', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const context = await fetchCandidateContext(user.id);
    const repos = [...(context.repos ?? [])];
    const targetRoles = new Set<string>((context.goals?.target_roles ?? []).map((role: string) => role.toLowerCase()));

    const curated = repos
      .map((repo: any) => {
        const repoSkills = (repo.inferred_skills ?? []).map((skill: string) => String(skill).toLowerCase());
        const relevance = repoSkills.some((skill: string) => Array.from(targetRoles).some((role) => role.includes(skill))) ? 20 : 0;
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
  } catch (error) {
    console.error('[POST /candidates/agents/github-curate]', error);
    res.status(500).json({ error: 'Failed to run GitHub curator' });
  }
});

const startInterviewSchema = z.object({
  target_role: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  format: z.enum(['technical', 'behavioral', 'system_design', 'mixed']),
});

candidateExperienceRouter.post('/agents/mock-interview', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = startInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const context = await fetchCandidateContext(user.id);
    const questionsResponse = await callCopilot<any>('/copilot/mock-interview', {
      skills: context.candidate?.skills || [],
      role_title: parsed.data.target_role,
      difficulty: parsed.data.difficulty,
    });

    const questions = (questionsResponse.questions || []).slice(0, 5).map((question: any, index: number) => ({
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
  } catch (error) {
    console.error('[POST /candidates/agents/mock-interview]', error);
    res.status(500).json({ error: 'Failed to start mock interview' });
  }
});

const answerInterviewSchema = z.object({
  question_index: z.number().int().min(0).max(4),
  answer: z.string().min(1),
  elapsed_seconds: z.number().int().min(0).optional(),
});

candidateExperienceRouter.post('/agents/mock-interview/:id/answer', async (req: Request, res: Response): Promise<void> => {
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

    const questions = (interview.questions_v2 || interview.questions || []) as any[];
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
  } catch (error) {
    console.error('[POST /candidates/agents/mock-interview/:id/answer]', error);
    res.status(500).json({ error: 'Failed to submit mock interview answer' });
  }
});

candidateExperienceRouter.get('/agents/mock-interview/history', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[GET /candidates/agents/mock-interview/history]', error);
    res.status(500).json({ error: 'Failed to load interview history' });
  }
});

// ==========================================
// V2 AGENTIC ROUTES
// ==========================================

candidateExperienceRouter.get('/feed', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const supabase = getSupabase();
    const status = req.query.status as string || 'unread';

    let query = supabase
      .from('agent_feed')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ feed: data ?? [] });
  } catch (error) {
    console.error('[GET /candidates/feed]', error);
    res.status(500).json({ error: 'Failed to load agent feed' });
  }
});

candidateExperienceRouter.get('/feed/briefing', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const supabase = getSupabase();

    const { data: preference } = await supabase
      .from('agent_preferences')
      .select('*')
      .eq('candidate_id', user.id)
      .maybeSingle();

    const { count: unreadCount } = await supabase
      .from('agent_feed')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', user.id)
      .eq('status', 'unread');

    const { data: latestMatches } = await supabase
      .from('candidate_matches')
      .select('*, parsed_jds(*)')
      .eq('candidate_id', user.id)
      .order('match_score', { ascending: false })
      .limit(3);

    res.json({
      summary: `You have ${unreadCount || 0} items waiting for review.`,
      autopilot_status: preference?.autopilot_enabled ? 'Active' : 'Paused',
      top_matches: latestMatches ?? [],
    });
  } catch (error) {
    console.error('[GET /candidates/feed/briefing]', error);
    res.status(500).json({ error: 'Failed to generate briefing' });
  }
});

candidateExperienceRouter.patch('/feed/:id/action', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const { action } = req.body; // 'read', 'archive', 'actioned'
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('agent_feed')
      .update({
        status: action === 'read' ? 'read' : action === 'archive' ? 'archived' : 'actioned',
      })
      .eq('id', req.params.id)
      .eq('candidate_id', user.id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('[PATCH /candidates/feed/:id/action]', error);
    res.status(500).json({ error: 'Failed to update feed item' });
  }
});

candidateExperienceRouter.get('/agent-preferences', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const { data, error } = await getSupabase()
      .from('agent_preferences')
      .select('*')
      .eq('candidate_id', user.id)
      .maybeSingle();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data || {
      autopilot_enabled: false,
      intro_style: 'balanced',
      target_match_score: 75,
      notifications_enabled: true,
    });
  } catch (error) {
    console.error('[GET /candidates/agent-preferences]', error);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
});

candidateExperienceRouter.put('/agent-preferences', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = updateAgentPreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { data, error } = await getSupabase()
      .from('agent_preferences')
      .upsert({
        candidate_id: user.id,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('[PUT /candidates/agent-preferences]', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

candidateExperienceRouter.post('/jobs/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = jobSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const context = await fetchCandidateContext(user.id);
    
    // Call Copilot for semantic search / evaluation
    const result = await callCopilot<any>('/copilot/semantic-search', {
      query: parsed.data.query,
      candidate: {
        skills: context.candidate?.skills || [],
        experience_years: context.candidate?.experience_years || 0,
        headline: context.candidate?.headline || '',
      },
    });

    res.json(result);
  } catch (error) {
    console.error('[POST /candidates/jobs/search]', error);
    res.status(500).json({ error: 'Failed to run conversational search' });
  }
});

candidateExperienceRouter.post('/jobs/:matchId/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const supabase = getSupabase();

    const { data: match } = await supabase
      .from('candidate_matches')
      .select('*, parsed_jds(*)')
      .eq('id', req.params.matchId)
      .eq('candidate_id', user.id)
      .single();

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const context = await fetchCandidateContext(user.id);
    
    const evaluation = await callCopilot<any>('/copilot/evaluate-job', {
      candidate: context.candidate,
      parsed_jd: match.parsed_jds,
    });

    const { data: savedEval, error: evalError } = await supabase
      .from('job_evaluations')
      .upsert({
        candidate_id: user.id,
        match_id: req.params.matchId,
        analysis: evaluation,
      })
      .select()
      .single();

    if (evalError) {
      res.status(400).json({ error: evalError.message });
      return;
    }

    res.json(savedEval);
  } catch (error) {
    console.error('[POST /candidates/jobs/:matchId/evaluate]', error);
    res.status(500).json({ error: 'Failed to evaluate job' });
  }
});

candidateExperienceRouter.post('/jobs/:matchId/apply', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const parsed = applyRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const supabase = getSupabase();
    
    // 1. Get Match & JD
    const { data: match } = await supabase
      .from('candidate_matches')
      .select('*, parsed_jds(*)')
      .eq('id', req.params.matchId)
      .eq('candidate_id', user.id)
      .single();

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // 2. Draft Intro if not provided
    let introText = parsed.data.intro_text;
    if (!introText) {
       const context = await fetchCandidateContext(user.id);
       const draft = await callCopilot<any>('/copilot/draft-intro', {
         candidate_id: user.id,
         parsed_jd: match.parsed_jds,
         candidate_full_profile: context.candidate,
         match_context: {
           matched_skills: match.matched_skills,
           match_score: match.match_score
         }
       });
       introText = draft.draft_text;
    }

    // 3. Mark as INTERESTED
    await supabase
      .from('candidate_matches')
      .update({
        status: 'interested',
        candidate_intro_message: introText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.matchId);

    // 4. Create Pipeline entry
    const jd = match.parsed_jds;
    if (jd.recruiter_id) {
       await supabase.from('pipeline').upsert({
         candidate_id: user.id,
         recruiter_id: jd.recruiter_id,
         stage: 'pending',
         notes: introText,
         updated_at: new Date().toISOString(),
       });
    }

    // 5. Create Intro entry
    await supabase.from('drafted_intros').insert({
      candidate_id: user.id,
      parsed_jd_id: jd.id,
      draft_text: introText || '',
      status: 'sent'
    });

    res.json({ success: true, intro_text: introText });
  } catch (error) {
    console.error('[POST /candidates/jobs/:matchId/apply]', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

candidateExperienceRouter.post('/agent/run', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = getUser(req);
    const result = await runAgentCycle(user.id);
    res.json(result);
  } catch (error) {
    console.error('[POST /candidates/agent/run]', error);
    res.status(500).json({ error: 'Failed to run agent cycle' });
  }
});

candidateExperienceRouter.get('/jobs/all', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { page = '1', limit = '20', search = '' } = req.query;
    const p = parseInt(page as string, 10);
    const l = parseInt(limit as string, 10);
    const offset = (p - 1) * l;

    let query = supabase
      .from('parsed_jds')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`role_title.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + l - 1);

    if (error) throw error;
    res.json({ jobs: data, total: count });
  } catch (error) {
    console.error('[GET /candidates/jobs/all]', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

candidateExperienceRouter.get('/streak', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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

candidateExperienceRouter.post('/case-studies', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[POST /candidates/case-studies]', error);
    res.status(500).json({ error: 'Failed to create case study' });
  }
});

candidateExperienceRouter.get('/case-studies', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[GET /candidates/case-studies]', error);
    res.status(500).json({ error: 'Failed to load case studies' });
  }
});

candidateExperienceRouter.delete('/case-studies/:id', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('[DELETE /candidates/case-studies/:id]', error);
    res.status(500).json({ error: 'Failed to delete case study' });
  }
});

candidateExperienceRouter.get('/profile/public/:username', async (req: Request, res: Response): Promise<void> => {
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
      .sort((left: any, right: any) => Number(right.is_featured) - Number(left.is_featured))
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
  } catch (error) {
    console.error('[GET /candidates/profile/public/:username]', error);
    res.status(500).json({ error: 'Failed to load public profile' });
  }
});
