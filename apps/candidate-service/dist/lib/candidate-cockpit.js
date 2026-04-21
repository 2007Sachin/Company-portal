import { getSupabase } from './supabase.js';
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}
function daysAgo(days) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
function normalizeTextArray(values) {
    return Array.isArray(values)
        ? values.map((value) => String(value).trim()).filter(Boolean)
        : [];
}
export function getTrustTier(score) {
    if (score >= 80)
        return 'Elite';
    if (score >= 60)
        return 'Trusted';
    if (score >= 40)
        return 'Verified';
    return 'Rising';
}
export async function fetchCandidateContext(candidateId) {
    const supabase = getSupabase();
    const [candidateRes, goalsRes, privacyRes, streakRes, reposRes, caseStudiesRes, videoRes, interviewsRes, agentActionsRes, eventsRes, searchRes, viewsRes,] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', candidateId).single(),
        supabase.from('candidate_goals').select('*').eq('candidate_id', candidateId).maybeSingle(),
        supabase.from('privacy_settings').select('*').eq('user_id', candidateId).maybeSingle(),
        supabase.from('candidate_streaks').select('*').eq('candidate_id', candidateId).maybeSingle(),
        supabase.from('github_repos').select('*').eq('candidate_id', candidateId),
        supabase.from('case_studies').select('*').eq('candidate_id', candidateId),
        supabase.from('video_pitches').select('*').eq('candidate_id', candidateId).maybeSingle(),
        supabase.from('mock_interviews').select('*').eq('candidate_id', candidateId),
        supabase.from('agent_actions').select('*').eq('candidate_id', candidateId),
        supabase.from('activity_events').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false }).limit(50),
        supabase.from('search_appearances').select('*').eq('candidate_id', candidateId),
        supabase.from('profile_views').select('*').eq('candidate_id', candidateId),
    ]);
    return {
        candidate: candidateRes.data ?? null,
        goals: goalsRes.data ?? null,
        privacy: privacyRes.data ?? null,
        streak: streakRes.data ?? null,
        repos: reposRes.data ?? [],
        caseStudies: caseStudiesRes.data ?? [],
        videoPitch: videoRes.data ?? null,
        mockInterviews: interviewsRes.data ?? [],
        agentActions: agentActionsRes.data ?? [],
        activityEvents: eventsRes.data ?? [],
        searchAppearances: searchRes.data ?? [],
        profileViews: viewsRes.data ?? [],
    };
}
export function buildScoreBreakdownFromContext(context) {
    const candidate = context.candidate ?? {};
    const skills = normalizeTextArray(candidate.skills);
    const goals = context.goals ?? {};
    const repos = context.repos ?? [];
    const caseStudies = context.caseStudies ?? [];
    const streak = context.streak ?? {};
    const mockInterviews = context.mockInterviews ?? [];
    const agentActions = context.agentActions ?? [];
    const commits90d = repos.reduce((sum, repo) => sum + Number(repo.commit_count_30d || 0) * 3, 0);
    const totalStars = repos.reduce((sum, repo) => sum + Number(repo.stars || 0), 0);
    const languageCount = new Set(repos.flatMap((repo) => normalizeTextArray(repo.inferred_skills))).size;
    const readmeCoverage = repos.filter((repo) => repo.ai_generated_readme).length;
    const githubVelocity = round(clamp((commits90d / 60) * 12, 0, 12) +
        clamp((totalStars / 20) * 5, 0, 5) +
        clamp((languageCount / 6) * 4, 0, 4) +
        clamp((readmeCoverage / 3) * 4, 0, 4), 1);
    const weightedSolved = Number(candidate.leetcode_easy_solved || 0) * 1 +
        Number(candidate.leetcode_medium_solved || 0) * 2 +
        Number(candidate.leetcode_hard_solved || 0) * 4;
    const problemSolving = round(clamp((weightedSolved / 180) * 20, 0, 20) +
        clamp((Number(candidate.leetcode_contest_rating || 0) / 2200) * 5, 0, 5), 1);
    const completenessSignals = [
        candidate.full_name,
        candidate.email,
        candidate.phone,
        candidate.city || candidate.location,
        candidate.college_name,
        candidate.graduation_year,
        candidate.headline,
        skills.length > 0,
        normalizeTextArray(goals.target_roles).length > 0,
        normalizeTextArray(candidate.preferred_company_types).length > 0 || normalizeTextArray(goals.target_roles).length > 0,
        normalizeTextArray(candidate.preferred_work_setup).length > 0,
        normalizeTextArray(candidate.preferred_locations).length > 0 || normalizeTextArray(goals.target_locations).length > 0,
        !!candidate.profile_photo_url,
        !!context.videoPitch,
        caseStudies.length > 0,
        !!candidate.github_username || !!candidate.github_verified,
        !!candidate.leetcode_username || !!candidate.leetcode_verified,
        !!candidate.data_consent,
    ];
    const profileCompleteness = round((completenessSignals.filter(Boolean).length / completenessSignals.length) * 20, 1);
    const recentActivityCount = context.activityEvents.filter((event) => new Date(event.created_at).getTime() >= new Date(daysAgo(30)).getTime()).length;
    const consistency = round(clamp((Number(streak.current_streak || 0) / 14) * 7, 0, 7) +
        clamp((commits90d / 45) * 4, 0, 4) +
        clamp((recentActivityCount / 12) * 4, 0, 4), 1);
    const acceptedAgentActions = agentActions.filter((action) => action.status === 'completed').length;
    const engagement = round(clamp((mockInterviews.length / 4) * 6, 0, 6) +
        clamp((acceptedAgentActions / 6) * 5, 0, 5) +
        clamp((recentActivityCount / 10) * 4, 0, 4), 1);
    const overall = round(clamp(githubVelocity, 0, 25) +
        clamp(problemSolving, 0, 25) +
        clamp(profileCompleteness, 0, 20) +
        clamp(consistency, 0, 15) +
        clamp(engagement, 0, 15), 1);
    return {
        overall,
        tier: getTrustTier(overall),
        breakdown: [
            { key: 'github_velocity', label: 'GitHub Velocity', score: round(githubVelocity, 1), max: 25, weight: 25 },
            { key: 'problem_solving', label: 'Problem Solving', score: round(problemSolving, 1), max: 25, weight: 25 },
            { key: 'profile_completeness', label: 'Profile Completeness', score: round(profileCompleteness, 1), max: 20, weight: 20 },
            { key: 'consistency', label: 'Consistency', score: round(consistency, 1), max: 15, weight: 15 },
            { key: 'engagement', label: 'Engagement', score: round(engagement, 1), max: 15, weight: 15 },
        ],
    };
}
export function buildScoreCoach(context) {
    const candidate = context.candidate ?? {};
    const actions = [];
    if (!candidate.github_username && !candidate.github_verified) {
        actions.push({
            id: 'connect-github',
            title: 'Connect GitHub',
            estimate_gain: 18,
            effort: 1,
            href: '/candidate/onboarding',
            description: 'Sync repos, commits, and languages so recruiters can see evidence, not just claims.',
        });
    }
    if (!candidate.leetcode_username && !candidate.leetcode_verified) {
        actions.push({
            id: 'connect-leetcode',
            title: 'Connect LeetCode',
            estimate_gain: 14,
            effort: 1,
            href: '/candidate/onboarding',
            description: 'Add problem-solving proof and unlock a stronger score baseline.',
        });
    }
    if (!context.videoPitch) {
        actions.push({
            id: 'upload-video',
            title: 'Upload intro video',
            estimate_gain: 12,
            effort: 2,
            href: '/candidate/proof',
            description: 'A concise video pitch makes your profile feel human and credible.',
        });
    }
    if ((context.caseStudies ?? []).length === 0) {
        actions.push({
            id: 'add-case-study',
            title: 'Add a case study',
            estimate_gain: 10,
            effort: 2,
            href: '/candidate/proof',
            description: 'Turn one project into a recruiter-readable story with scope, stack, and impact.',
        });
    }
    if (Number(candidate.leetcode_medium_solved || 0) < 5) {
        actions.push({
            id: 'solve-mediums',
            title: 'Complete 5 LeetCode mediums this week',
            estimate_gain: 8,
            effort: 3,
            href: '/candidate/dashboard',
            description: 'This is the fastest way to grow your problem-solving sub-score.',
        });
    }
    if ((context.repos ?? []).length === 0) {
        actions.push({
            id: 'sync-repos',
            title: 'Sync your best repos',
            estimate_gain: 9,
            effort: 2,
            href: '/candidate/proof',
            description: 'Recruiters trust visible code more than a broad skills list.',
        });
    }
    if (normalizeTextArray(candidate.skills).length < 4) {
        actions.push({
            id: 'add-skills',
            title: 'Add 2 more core skills',
            estimate_gain: 6,
            effort: 1,
            href: '/candidate/onboarding',
            description: 'Richer skill coverage improves both score quality and match quality.',
        });
    }
    return actions
        .sort((left, right) => (right.estimate_gain / right.effort) - (left.estimate_gain / left.effort))
        .slice(0, 3)
        .map((action) => ({
        ...action,
        impact_label: `+${action.estimate_gain} pts`,
    }));
}
export async function recalculatePulseScoreV2(candidateId) {
    const supabase = getSupabase();
    const context = await fetchCandidateContext(candidateId);
    const score = buildScoreBreakdownFromContext(context);
    const previousScore = Number(context.candidate?.pulse_score || 0);
    await supabase
        .from('candidates')
        .update({
        pulse_score: Math.round(score.overall),
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    })
        .eq('id', candidateId);
    if (Math.round(score.overall) !== previousScore) {
        const delta = Math.round(score.overall) - previousScore;
        await recordActivityEvent(candidateId, 'score_change', {
            previous_score: previousScore,
            current_score: Math.round(score.overall),
            delta,
            tier: score.tier,
        });
    }
    return score;
}
export async function recordActivityEvent(candidateId, eventType, eventData) {
    const supabase = getSupabase();
    await supabase.from('activity_events').insert({
        candidate_id: candidateId,
        event_type: eventType,
        event_data: eventData,
    });
}
export async function buildVisibilitySummary(candidateId) {
    const supabase = getSupabase();
    const context = await fetchCandidateContext(candidateId);
    const candidate = context.candidate ?? {};
    const candidateSkill = normalizeTextArray(candidate.skills)[0];
    const city = candidate.city || candidate.location || 'your city';
    const searchesThisWeek = context.searchAppearances.filter((appearance) => new Date(appearance.appeared_at).getTime() >= new Date(daysAgo(7)).getTime()).length;
    const profileViewsThisWeek = context.profileViews.filter((view) => new Date(view.viewed_at).getTime() >= new Date(daysAgo(7)).getTime()).length;
    let rankPercentile = null;
    if (candidateSkill && city) {
        const { data: peers } = await supabase
            .from('candidates')
            .select('id, pulse_score, skills, city, location')
            .contains('skills', [candidateSkill]);
        const sameMarket = (peers ?? []).filter((peer) => (peer.city || peer.location || '').toLowerCase() === String(city).toLowerCase());
        if (sameMarket.length > 0) {
            const sorted = sameMarket
                .map((peer) => Number(peer.pulse_score || 0))
                .sort((left, right) => right - left);
            const rank = sorted.findIndex((score) => score <= Number(candidate.pulse_score || 0));
            rankPercentile = clamp(Math.round(((rank < 0 ? sorted.length : rank + 1) / sorted.length) * 100), 1, 100);
        }
    }
    const trendMap = new Map();
    for (let i = 0; i < 28; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendMap.set(date.toISOString().slice(0, 10), 0);
    }
    context.profileViews.forEach((view) => {
        const key = String(view.viewed_at).slice(0, 10);
        trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    });
    const sparkline = Array.from(trendMap.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-28)
        .map(([date, count]) => ({ date, count }));
    return {
        searches_this_week: searchesThisWeek,
        profile_views_this_week: profileViewsThisWeek,
        stack_rank_percentile: rankPercentile,
        primary_skill: candidateSkill || null,
        city,
        sparkline,
    };
}
export async function listActivityFeed(candidateId, limit = 10) {
    const supabase = getSupabase();
    const { data } = await supabase
        .from('activity_events')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(limit);
    return data ?? [];
}
function computeExperienceFit(candidateYears, jdYears) {
    if (jdYears <= 0)
        return 100;
    if (candidateYears >= jdYears)
        return 100;
    if (candidateYears + 1 >= jdYears)
        return 80;
    if (candidateYears + 2 >= jdYears)
        return 55;
    return 20;
}
function computePreferenceAlignment(candidate, goals, jd) {
    let score = 40;
    const preferredLocations = normalizeTextArray(candidate.preferred_locations).concat(normalizeTextArray(goals.target_locations));
    const workSetups = normalizeTextArray(candidate.preferred_work_setup);
    const companyTypes = normalizeTextArray(candidate.preferred_company_types);
    if (preferredLocations.length > 0 && jd.location) {
        score += preferredLocations.some((location) => location.toLowerCase() === String(jd.location).toLowerCase()) ? 25 : 0;
    }
    else {
        score += 10;
    }
    if (workSetups.length > 0 && jd.remote_type) {
        score += workSetups.some((setup) => setup.toLowerCase() === String(jd.remote_type).toLowerCase()) ? 20 : 0;
    }
    else {
        score += 10;
    }
    if (companyTypes.length > 0 && jd.company_type) {
        score += companyTypes.some((type) => type.toLowerCase() === String(jd.company_type).toLowerCase()) ? 15 : 0;
    }
    else {
        score += 10;
    }
    if (candidate.expected_ctc_min && candidate.expected_ctc_max && jd.ctc_min && jd.ctc_max) {
        const overlaps = candidate.expected_ctc_min <= jd.ctc_max && candidate.expected_ctc_max >= jd.ctc_min;
        score += overlaps ? 20 : 0;
    }
    else {
        score += 10;
    }
    return clamp(score, 0, 100);
}
export async function computeMatchesForCandidate(candidateId) {
    const supabase = getSupabase();
    const context = await fetchCandidateContext(candidateId);
    const candidate = context.candidate ?? {};
    const goals = context.goals ?? {};
    const { data: jds } = await supabase
        .from('parsed_jds')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);
    const candidateSkills = normalizeTextArray(candidate.skills).map((skill) => skill.toLowerCase());
    const pulseScoreNormalized = clamp(Number(candidate.pulse_score || 0) / 100, 0, 1);
    const recentActivity = Number(candidate.last_active_at) || context.activityEvents.some((event) => new Date(event.created_at).getTime() >= new Date(daysAgo(7)).getTime()) ? 100 : 30;
    const matches = (jds ?? []).map((jd) => {
        const jdSkills = normalizeTextArray(jd.skills).map((skill) => skill.toLowerCase());
        const matchingSkills = jdSkills.filter((skill) => candidateSkills.includes(skill));
        const missingSkills = jdSkills.filter((skill) => !candidateSkills.includes(skill));
        const skillOverlapScore = jdSkills.length === 0 ? 60 : (matchingSkills.length / jdSkills.length) * 100;
        const experienceFitScore = computeExperienceFit(Number(candidate.experience_years || 0), Number(jd.experience_years || 0));
        const preferenceAlignment = computePreferenceAlignment(candidate, goals, jd);
        const recencyBonus = recentActivity;
        const matchScore = round(skillOverlapScore * 0.4 +
            experienceFitScore * 0.2 +
            preferenceAlignment * 0.2 +
            pulseScoreNormalized * 100 * 0.1 +
            recencyBonus * 0.1, 2);
        return {
            candidate_id: candidateId,
            parsed_jd_id: jd.id,
            jd_id: jd.id,
            match_score: matchScore,
            matching_skills: matchingSkills,
            matched_skills: matchingSkills,
            missing_skills: missingSkills,
            match_reasoning: matchingSkills.length > 0
                ? `Strong overlap in ${matchingSkills.slice(0, 3).join(', ')} with ${getTrustTier(Number(candidate.pulse_score || 0)).toLowerCase()} candidate signals.`
                : 'This role is a stretch match today, but the preferences and current momentum still line up.',
            why_you: matchingSkills.length > 0
                ? `You already show proof in ${matchingSkills.slice(0, 3).join(', ')}, which maps directly to this role.`
                : 'Pulse sees a broader career fit here, but you need stronger proof in the requested stack.',
            growth_opportunity: missingSkills.length > 0
                ? `Close the gap on ${missingSkills.slice(0, 2).join(', ')} to improve this match fast.`
                : 'Your current profile is already close to recruiter-ready for this role.',
            status: matchScore >= 40 ? 'new' : 'dismissed',
            updated_at: new Date().toISOString(),
        };
    }).filter((match) => match.match_score >= 40);
    if (matches.length > 0) {
        await supabase.from('candidate_matches').upsert(matches, {
            onConflict: 'candidate_id,parsed_jd_id',
        });
    }
    for (const match of matches.slice(0, 5)) {
        await recordActivityEvent(candidateId, 'new_match', {
            parsed_jd_id: match.parsed_jd_id,
            match_score: match.match_score,
            matching_skills: match.matching_skills,
        });
    }
    return matches.sort((left, right) => Number(right.match_score) - Number(left.match_score));
}
export async function getOrCreateDailyChallenge(candidateId) {
    const supabase = getSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('challenge_date', today)
        .maybeSingle();
    if (existing) {
        return existing;
    }
    const context = await fetchCandidateContext(candidateId);
    const candidate = context.candidate ?? {};
    const targetRoles = normalizeTextArray(context.goals?.target_roles);
    const skills = normalizeTextArray(candidate.skills);
    const challengePool = [
        {
            title: `Solve a ${Number(candidate.leetcode_medium_solved || 0) > 25 ? 'hard' : 'medium'} array or DP problem`,
            difficulty: Number(candidate.leetcode_medium_solved || 0) > 25 ? 'hard' : 'medium',
            estimated_time: '35 min',
            skill_tag: skills[0] || targetRoles[0] || 'problem solving',
            external_url: 'https://leetcode.com/problemset/',
        },
        {
            title: 'Push one meaningful improvement to your strongest repo',
            difficulty: 'medium',
            estimated_time: '30 min',
            skill_tag: skills[0] || 'GitHub',
            external_url: 'https://github.com/',
        },
        {
            title: 'Turn one project into a recruiter-readable case study',
            difficulty: 'easy',
            estimated_time: '20 min',
            skill_tag: targetRoles[0] || 'portfolio',
            external_url: '/candidate/proof',
        },
    ];
    const challengeData = challengePool[Math.floor(Math.random() * challengePool.length)];
    const { data } = await supabase
        .from('daily_challenges')
        .insert({
        candidate_id: candidateId,
        challenge_date: today,
        challenge_type: 'daily_challenge',
        challenge_data: challengeData,
        completed: false,
    })
        .select('*')
        .single();
    return data;
}
//# sourceMappingURL=candidate-cockpit.js.map