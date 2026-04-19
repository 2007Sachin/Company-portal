/**
 * Emits a proof event and triggers a score recalculation
 */
export declare function emitProofEvent(candidateId: string, eventType: string, eventData: Record<string, any>, scoreImpact: number): Promise<void>;
/**
 * Re-calculates Pulse Score based on all profile signals and proof events
 */
export declare function recalculatePulseScore(candidateId: string): Promise<number | undefined>;
//# sourceMappingURL=proof.d.ts.map