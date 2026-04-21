import { getSupabase } from './supabase.js';
import { recalculatePulseScoreV2 } from './candidate-cockpit.js';

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
  try {
    const score = await recalculatePulseScoreV2(candidateId);
    console.log(`[recalculatePulseScore] Candidate ${candidateId}: ${score.overall}`);
    return score.overall;
  } catch (err) {
    console.error('[recalculatePulseScore] Error:', err);
  }
}
