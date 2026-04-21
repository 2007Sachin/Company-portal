import { getSupabase } from './supabase.js';
import { 
    computeMatchesForCandidate, 
    fetchCandidateContext, 
    recalculatePulseScoreV2,
    recordActivityEvent
} from './candidate-cockpit.js';

async function callCopilot<T>(path: string, body: Record<string, any>): Promise<T> {
    const baseUrl = process.env.COPILOT_SERVICE_URL || 'http://copilot-service:3005';
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Copilot fail: ${await response.text()}`);
    return response.json() as Promise<T>;
}

export async function runAgentCycle(candidateId: string) {
    const supabase = getSupabase();
    const context = await fetchCandidateContext(candidateId);
    
    // 1. Check Preferences
    const { data: prefs } = await supabase
        .from('agent_preferences')
        .select('*')
        .eq('candidate_id', candidateId)
        .maybeSingle();

    const autopilot = prefs?.autopilot_enabled ?? false;
    const threshold = prefs?.target_match_score ?? 75;

    // 2. Observe: New Matches
    const matches = await computeMatchesForCandidate(candidateId);
    const newHighMatches = matches.filter(m => m.match_score >= threshold && m.status === 'new');

    for (const match of newHighMatches) {
        // Create Feed Item
        const { data: existing } = await supabase
            .from('agent_feed')
            .select('id')
            .eq('candidate_id', candidateId)
            .eq('type', 'match_found')
            .eq('data->parsed_jd_id', match.parsed_jd_id)
            .maybeSingle();

        if (!existing) {
            await supabase.from('agent_feed').insert({
                candidate_id: candidateId,
                type: 'match_found',
                title: `Strong match at ${match.parsed_jds?.company_name || 'a new partner'}`,
                description: `Found a ${match.match_score}% match for ${match.parsed_jds?.role_title}. Your skills in ${match.matching_skills?.slice(0, 2).join(', ')} are a direct fit.`,
                data: {
                    match_id: match.id,
                    parsed_jd_id: match.parsed_jd_id,
                    match_score: match.match_score,
                    role_title: match.parsed_jds?.role_title,
                    company_name: match.parsed_jds?.company_name,
                    location: match.parsed_jds?.location
                },
                priority: match.match_score >= 90 ? 'high' : 'medium'
            });

            // If autopilot, draft intro immediately
            if (autopilot) {
                await runIntroDraftingStep(candidateId, match, context, prefs);
            }
        }
    }

    // 3. Observe: Profile Milestones
    if (context.candidate?.pulse_score < 60) {
        // High impact suggestion
        await supabase.from('agent_feed').upsert({
            candidate_id: candidateId,
            type: 'profile_optimized',
            title: "Improve your trust signal",
            description: "Your Pulse Score is currently in the 'Rising' tier. Connecting your GitHub would likely boost it by +15 points immediately.",
            data: { action: 'connect_github', potential_gain: 15 },
            status: 'unread'
        }, { onConflict: 'candidate_id,type' });
    }

    // 4. Think: Career Intel (Daily Pulse)
    const { count: views } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', candidateId)
        .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if ((views || 0) > 0) {
        await supabase.from('agent_feed').insert({
            candidate_id: candidateId,
            type: 'daily_pulse',
            title: "Your Daily Traction",
            description: `Recruiters viewed your profile ${views} times in the last 24 hours. Your visibility is increasing!`,
            data: { views_count: views },
            priority: 'medium'
        });
    }

    return { success: true };
}

async function runIntroDraftingStep(candidateId: string, match: any, context: any, prefs: any) {
    const supabase = getSupabase();
    try {
        const draft = await callCopilot<any>('/copilot/draft-intro', {
            candidate_id: candidateId,
            parsed_jd: match.parsed_jds,
            candidate_full_profile: context.candidate,
            match_context: {
                matched_skills: match.matched_skills,
                match_score: match.match_score,
                style: prefs?.intro_style || 'balanced'
            }
        });

        await supabase.from('agent_feed').insert({
            candidate_id: candidateId,
            type: 'intro_drafted',
            title: `Drafted intro for ${match.parsed_jds?.role_title}`,
            description: `Based on your ${prefs?.intro_style || 'balanced'} preference, I've drafted a personalized intro for this role. Review and send it now.`,
            data: {
                match_id: match.id,
                draft_text: draft.draft_text,
                style: prefs?.intro_style || 'balanced'
            },
            priority: 'high'
        });

        await recordActivityEvent(candidateId, 'agent_action', {
            agent_type: 'intro_drafter',
            match_id: match.id,
            summary: 'Intro drafted for review'
        });
    } catch (err) {
        console.error('Intro drafting failed', err);
    }
}
