import { getSupabase } from './supabase.js';

/**
 * Emits a proof event and triggers a score recalculation
 */
export async function emitProofEvent(
  candidateId: string,
  eventType: string,
  eventData: Record<string, any>,
  scoreImpact: number
) {
  const supabase = getSupabase();

  // 1. Insert proof event
  const { error: eventError } = await supabase
    .from('proof_events')
    .insert({
      candidate_id: candidateId,
      event_type: eventType,
      event_data: eventData,
      score_impact: scoreImpact,
    });

  if (eventError) {
    console.error('[emitProofEvent] Error inserting event:', eventError);
    return;
  }

  // 2. Trigger score recalculation
  await recalculatePulseScore(candidateId);
}

/**
 * Re-calculates Pulse Score based on all profile signals and proof events
 */
export async function recalculatePulseScore(candidateId: string) {
  const supabase = getSupabase();

  try {
    // 1. Fetch Candidate profile
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candError || !candidate) throw candError || new Error('Candidate not found');

    // 2. Fetch associated proof-of-work data
    const [
      { count: caseStudyCount },
      { data: videoPitch },
      { data: passedAssessments },
      { data: featuredRepos }
    ] = await Promise.all([
      supabase.from('case_studies').select('*', { count: 'exact', head: true }).eq('candidate_id', candidateId),
      supabase.from('video_pitches').select('transcript').eq('candidate_id', candidateId).maybeSingle(),
      supabase.from('skill_assessments').select('score').eq('candidate_id', candidateId).gte('score', 70),
      supabase.from('github_repos').select('ai_generated_readme').eq('candidate_id', candidateId).eq('is_featured', true)
    ]);

    // 3. Calculation Logic
    let score = 50; // Base score

    // Onboarding verifications
    if (candidate.github_verified) score += 20;
    if (candidate.leetcode_verified) score += 15;
    if (candidate.has_video_pitch) {
      score += 10;
      // Bonus for transcript
      if (videoPitch?.transcript) {
        score += 10;
      }
    }

    // Skills
    const skillsCount = candidate.skills?.length || 0;
    score += Math.min(skillsCount * 5, 25);

    // Case Studies
    const csCount = caseStudyCount || 0;
    score += Math.min(csCount * 5, 15);

    // Skill Assessments
    const saCount = passedAssessments?.length || 0;
    score += Math.min(saCount * 5, 20);

    // Featured Repos with AI READMEs
    const aiReadmeCount = featuredRepos?.filter(r => r.ai_generated_readme).length || 0;
    score += Math.min(aiReadmeCount * 3, 9);

    // 4. Cap and Update
    const finalScore = Math.min(score, 150);

    await supabase
      .from('candidates')
      .update({ pulse_score: finalScore })
      .eq('id', candidateId);

    console.log(`[recalculatePulseScore] Candidate ${candidateId}: ${finalScore}`);
    return finalScore;
  } catch (err) {
    console.error('[recalculatePulseScore] Error:', err);
  }
}
