export declare function getTrustTier(score: number): "Elite" | "Trusted" | "Verified" | "Rising";
export declare function fetchCandidateContext(candidateId: string): Promise<{
    candidate: any;
    goals: any;
    privacy: any;
    streak: any;
    repos: any[];
    caseStudies: any[];
    videoPitch: any;
    mockInterviews: any[];
    agentActions: any[];
    activityEvents: any[];
    searchAppearances: any[];
    profileViews: any[];
}>;
export declare function buildScoreBreakdownFromContext(context: Awaited<ReturnType<typeof fetchCandidateContext>>): {
    overall: number;
    tier: string;
    breakdown: {
        key: string;
        label: string;
        score: number;
        max: number;
        weight: number;
    }[];
};
export declare function buildScoreCoach(context: Awaited<ReturnType<typeof fetchCandidateContext>>): {
    impact_label: string;
    id: string;
    title: string;
    estimate_gain: number;
    effort: number;
    href: string;
    description: string;
}[];
export declare function recalculatePulseScoreV2(candidateId: string): Promise<{
    overall: number;
    tier: string;
    breakdown: {
        key: string;
        label: string;
        score: number;
        max: number;
        weight: number;
    }[];
}>;
export declare function recordActivityEvent(candidateId: string, eventType: string, eventData: Record<string, any>): Promise<void>;
export declare function buildVisibilitySummary(candidateId: string): Promise<{
    searches_this_week: number;
    profile_views_this_week: number;
    stack_rank_percentile: number | null;
    primary_skill: string | null;
    city: any;
    sparkline: {
        date: string;
        count: number;
    }[];
}>;
export declare function listActivityFeed(candidateId: string, limit?: number): Promise<any[]>;
export declare function computeMatchesForCandidate(candidateId: string): Promise<{
    candidate_id: string;
    parsed_jd_id: any;
    jd_id: any;
    match_score: number;
    matching_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
    match_reasoning: string;
    why_you: string;
    growth_opportunity: string;
    status: string;
    updated_at: string;
}[]>;
export declare function getOrCreateDailyChallenge(candidateId: string): Promise<any>;
//# sourceMappingURL=candidate-cockpit.d.ts.map