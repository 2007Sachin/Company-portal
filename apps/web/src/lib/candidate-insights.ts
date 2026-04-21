export interface ProofChecklistItem {
  key: string;
  label: string;
  description: string;
  points: number;
  complete: boolean;
  href: string;
}

export interface CandidateReadinessSummary {
  profileCompletion: number;
  proofCompletion: number;
  recruiterReadiness: number;
  credibilityTier: string;
  strongestSignal: string;
  weakestSignal: string;
}

function hasCaseStudies(candidate: any) {
  return (candidate?.case_studies_count || 0) > 0;
}

function hasFeaturedRepos(candidate: any, events: any[]) {
  return !!candidate?.github_verified || events.some((event) => event?.event_type === 'github_commit');
}

function hasAssessments(events: any[]) {
  return events.some((event) => event?.event_type === 'skill_assessment_passed');
}

function hasMockInterview(events: any[]) {
  return events.some((event) => event?.event_type === 'mock_interview_completed');
}

function hasVideo(candidate: any) {
  return !!candidate?.has_video_pitch;
}

function hasLeetCode(candidate: any) {
  return !!candidate?.leetcode_verified;
}

function hasSkills(candidate: any) {
  return Array.isArray(candidate?.skills) && candidate.skills.length >= 3;
}

function hasHeadline(candidate: any) {
  return typeof candidate?.headline === 'string' && candidate.headline.trim().length >= 12;
}

export function buildProofChecklist(candidate: any, events: any[] = []): ProofChecklistItem[] {
  return [
    {
      key: 'headline',
      label: 'Strong headline',
      description: 'Tell recruiters what you do and where you are strongest.',
      points: 10,
      complete: hasHeadline(candidate),
      href: '/candidate/copilot?agent=optimizer',
    },
    {
      key: 'skills',
      label: 'Skill graph',
      description: 'Add at least 3 skills so matching and coaching become specific.',
      points: 10,
      complete: hasSkills(candidate),
      href: '/candidate/onboarding',
    },
    {
      key: 'github',
      label: 'GitHub connected',
      description: 'Verified GitHub activity is the strongest raw proof signal.',
      points: 20,
      complete: !!candidate?.github_verified,
      href: '/candidate/proof',
    },
    {
      key: 'repos',
      label: 'Project proof',
      description: 'Feature repos and show real build depth.',
      points: 15,
      complete: hasFeaturedRepos(candidate, events),
      href: '/candidate/proof',
    },
    {
      key: 'leetcode',
      label: 'LeetCode verified',
      description: 'Adds problem-solving credibility to your profile.',
      points: 20,
      complete: hasLeetCode(candidate),
      href: '/candidate/proof',
    },
    {
      key: 'video',
      label: 'Video pitch',
      description: 'Shows communication, confidence, and intent.',
      points: 15,
      complete: hasVideo(candidate),
      href: '/candidate/proof',
    },
    {
      key: 'interview',
      label: 'Mock interview',
      description: 'Turns practice into recruiter-readable readiness.',
      points: 15,
      complete: hasMockInterview(events),
      href: '/candidate/prep',
    },
    {
      key: 'assessment',
      label: 'Skill assessment',
      description: 'Earn a verified badge in one of your core skills.',
      points: 15,
      complete: hasAssessments(events),
      href: '/candidate/proof',
    },
    {
      key: 'cases',
      label: 'Case study',
      description: 'Package your projects into recruiter-readable stories.',
      points: 15,
      complete: hasCaseStudies(candidate),
      href: '/candidate/proof',
    },
  ];
}

export function computeCandidateReadiness(candidate: any, score: number, events: any[] = [], matches: any[] = []): CandidateReadinessSummary {
  const checklist = buildProofChecklist(candidate, events);
  const completed = checklist.filter((item) => item.complete).length;
  const proofCompletion = Math.round((completed / checklist.length) * 100);

  const profileFactors = [
    !!candidate?.full_name,
    hasHeadline(candidate),
    !!candidate?.location,
    hasSkills(candidate),
    Array.isArray(candidate?.target_roles) ? candidate.target_roles.length > 0 : true,
  ];
  const profileCompletion = Math.round((profileFactors.filter(Boolean).length / profileFactors.length) * 100);

  const matchReadiness = matches.length > 0
    ? Math.round(matches.slice(0, 5).reduce((sum, match) => sum + (match?.match_score || 0), 0) / Math.min(matches.length, 5))
    : 0;

  const recruiterReadiness = Math.round(((proofCompletion * 0.45) + (profileCompletion * 0.2) + ((score / 100) * 100 * 0.25) + (matchReadiness * 0.1)));

  const strongestSignal = checklist.find((item) => item.complete)?.label || 'Profile setup';
  const weakestSignal = checklist.find((item) => !item.complete)?.label || 'No critical gaps';

  let credibilityTier = 'Rising';
  if (score >= 80) credibilityTier = 'Elite';
  else if (score >= 60) credibilityTier = 'Trusted';
  else if (score >= 40) credibilityTier = 'Verified';

  return {
    profileCompletion,
    proofCompletion,
    recruiterReadiness,
    credibilityTier,
    strongestSignal,
    weakestSignal,
  };
}

export function buildNextActions(candidate: any, events: any[] = [], matches: any[] = []) {
  const checklist = buildProofChecklist(candidate, events);
  const pending = checklist.filter((item) => !item.complete);

  const actions = pending.slice(0, 4).map((item) => ({
    title: item.label,
    description: item.description,
    impact: `+${item.points} credibility points`,
    href: item.href,
  }));

  if (matches.length > 0) {
    const first = matches[0];
    actions.unshift({
      title: 'Review your top match',
      description: `You already have a ${first?.match_score || 0}% fit role waiting in your radar.`,
      impact: 'Convert profile strength into recruiter attention',
      href: '/candidate/opportunities',
    });
  }

  return actions.slice(0, 4);
}

export function buildOpportunityRecommendation(match: any) {
  const matchScore = match?.match_score || 0;
  const missingSkills = Array.isArray(match?.missing_skills) ? match.missing_skills.length : 0;
  const matchedSkills = Array.isArray(match?.matched_skills) ? match.matched_skills.length : 0;
  const readiness = Math.max(0, Math.min(100, Math.round(matchScore - (missingSkills * 8) + (matchedSkills * 3))));

  let recommendation = 'Improve first';
  if (readiness >= 85) recommendation = 'Apply now';
  else if (readiness >= 65) recommendation = 'Strong fit';
  else if (readiness >= 45) recommendation = 'Stretch fit';

  return {
    readiness,
    recommendation,
  };
}
