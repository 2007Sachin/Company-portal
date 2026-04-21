# Pulse Candidate Experience Roadmap

## Product Thesis

Pulse should not behave like a generic job portal with a profile page.
Pulse should be a credibility engine for students and early-career developers who do real work but struggle to make that work legible and trustworthy to recruiters.

The core candidate promise is:

1. I can prove my ability even without brand-name pedigree.
2. My profile is built from evidence, not claims.
3. AI helps me transform raw work into recruiter-readable proof.
4. Opportunities are matched to my proof-of-work, not just keywords.

## Current Repo Foundation

The existing codebase already contains the right building blocks:

- Auth entry: `apps/web/src/app/auth/login/page.tsx`
- Multi-step candidate onboarding: `apps/web/src/app/candidate/onboarding/page.tsx`
- Legacy onboarding steps: `apps/web/src/app/onboarding/step-1` to `step-5`
- Candidate dashboard: `apps/web/src/app/candidate/dashboard/page.tsx`
- Proof system: `apps/web/src/app/candidate/proof/page.tsx`
- AI Copilot: `apps/web/src/app/candidate/copilot/page.tsx`
- Opportunities feed: `apps/web/src/app/candidate/opportunities/page.tsx`
- Recruiter discovery and pipeline: `apps/web/src/app/recruiter/discover`, `dashboard`, `requests`
- Candidate and recruiter APIs: `apps/web/src/lib/api.ts`

This means the work is not greenfield. It is a product restructuring and capability upgrade.

## Product Problems To Solve

### 1. Onboarding ends without a strong payoff

The current onboarding successfully collects profile data, GitHub, video, and goals, but the user lands in a dashboard that feels like a collection of widgets rather than a major outcome.

### 2. Proof exists, but is fragmented

Proof is spread across:

- onboarding
- proof builder
- copilot
- opportunities

The user does not feel that Pulse is building a single "credible identity" from these pieces.

### 3. The dashboard is metrics-first, not outcome-first

The current dashboard has good blocks:

- score
- streak
- proof feed
- opportunities
- inbox

But it does not answer the candidate's most important questions:

1. How credible am I right now?
2. Why am I credible or not credible?
3. What should I do next to improve?
4. Which jobs am I truly ready for?
5. What recruiter signals am I generating?

### 4. Opportunities are useful, but not yet "agentic"

The current opportunities experience has matches, saves, dismissals, and AI intros.
It still feels like a better job board rather than an AI operating system that guides the candidate.

### 5. Candidate and recruiter sides are connected technically, but not surfaced as one ecosystem

Recruiter flows already exist, and candidate opportunity/messaging flows already exist.
The product needs to make that connection explicit:

- recruiter-posted jobs create candidate-side opportunities
- candidate proof affects recruiter discovery
- candidate interest flows back into recruiter requests and pipeline

## Target Candidate Experience

### Stage 1: Entry

When a user clicks sign in from the site:

- they land on `/auth/login`
- they see the candidate/recruiter toggle
- new users still use the candidate path

This already exists and should remain.

### Stage 2: Credibility Onboarding

Candidate onboarding should be framed as "build your proof-of-work profile", not just profile setup.

Recommended step framing:

1. Identity
- full name
- headline
- location
- experience
- notice period

2. Skill graph
- core skills
- inferred stack
- preferred work type

3. Proof sources
- GitHub connect and repo scan
- featured repos
- case studies
- project links

4. Verification layer
- LeetCode
- intro video
- optional assessment seeding

5. Career intent
- target roles
- target locations
- compensation
- growth interests
- recruiter visibility

### Stage 3: Mission Control Landing

After onboarding, the user should land on a candidate mission-control dashboard.

This page should answer:

1. What is my Pulse Score?
2. What is driving it?
3. What proof do I still need?
4. Which recruiter-visible signals do I have?
5. Which jobs are strong-fit right now?
6. What should I do next?

### Stage 4: Continuous AI Agent Support

The AI layer should not feel like a separate toy page.
It should feel embedded across the product:

- onboarding guidance
- profile improvement suggestions
- proof generation
- job fit explanations
- intro drafting
- gap identification
- interview preparation

## Proposed Information Architecture

Keep candidate-side navigation centered around outcomes instead of feature silos.

### Recommended primary navigation

1. Overview
2. Proof
3. Matches
4. Inbox
5. AI Coach
6. Settings

### Mapping from current pages

- `candidate/dashboard` becomes `Overview`
- `candidate/proof` remains `Proof`
- `candidate/opportunities` becomes `Matches`
- `candidate/inbox` remains `Inbox`
- `candidate/copilot` becomes `AI Coach`
- `settings` remains `Settings`

The `candidate/streak` and `candidate/prep` pages should remain secondary/deep-link experiences rather than primary nav destinations.

## Candidate Dashboard Redesign

The current `candidate/dashboard/page.tsx` is the best first place to invest because it already aggregates the right data.

### New dashboard sections

#### 1. Hero: Pulse Credibility

Display:

- Pulse Score
- credibility tier
- recruiter readiness
- profile completion
- score trend

Add:

- "Why this score" explainer
- one-line AI recommendation
- proof completion progress

#### 2. Proof Completeness

Use a checklist-based module that shows:

- GitHub connected
- featured repos selected
- case studies added
- intro video uploaded
- LeetCode connected
- assessment completed
- headline optimized

Each item should show:

- status
- points unlocked
- CTA to complete

#### 3. Recruiter Readiness

Create a recruiter-facing readiness summary:

- strongest proof signal
- weakest missing signal
- roles the candidate is most legible for
- likely recruiter concerns

This can be generated initially on the client from available data, then upgraded through Copilot endpoints later.

#### 4. Opportunity Radar

Upgrade current "Top Opportunities" into:

- strong fit
- stretch fit
- not ready yet

Each card should show:

- fit score
- readiness score
- top matched proof
- missing proof
- recommended next action

#### 5. Recruiter Signals

Expand current inbox preview into:

- profile views
- saves
- connection requests
- recruiter unlock requests
- recent engagement trend

#### 6. AI Next Actions

Prominently show 3 to 5 recommended actions such as:

- feature one more repo
- convert a repo into a case study
- record or improve intro video
- complete one assessment
- strengthen a skill gap for a target role

## Proof System Upgrade

The `candidate/proof/page.tsx` already contains the main proof modules. The key upgrade is to unify them under one concept: "evidence cards".

### Proof artifacts to support

1. GitHub repo cards
- repo title
- stars and activity
- inferred skills
- AI-generated README
- recruiter relevance tag
- featured / non-featured state

2. Case studies
- problem
- approach
- stack
- impact
- metrics
- AI normalization

3. Skill assessments
- verified badge
- score
- date earned
- recruiter weight

4. Video pitch
- video
- transcript
- AI clarity summary
- communication credibility

5. Mock interviews
- completion status
- shareable results
- confidence signals

### What to add next

- repo-to-case-study conversion flow
- recruiter-readable proof summaries
- proof quality scoring
- explicit point contribution per artifact

## AI Coach Product Direction

The current `candidate/copilot/page.tsx` already supports:

- profile optimizer
- score coach
- mock interview
- opportunity radar

This is strong, but it should evolve from "tabbed tools" into a persistent agent.

### Short-term improvement

Keep the current page, but add:

- a persistent "recommended next move"
- a unified action queue
- a "fix this now" CTA from dashboard widgets

### Medium-term agent jobs

The AI agent should be able to:

1. explain score gaps
2. suggest the highest-leverage proof improvement
3. convert raw project inputs into case studies
4. explain why a job is or is not a fit
5. draft recruiter intros
6. recommend interview prep based on job matches

## Matches and Opportunity System

The current `candidate/opportunities/page.tsx` already has the right core mechanics:

- matched feed
- save
- dismiss
- engaged
- recompute opportunities
- AI intro drafts

### Product improvements

Turn this into a "fit intelligence" experience:

Each match should show:

- fit score
- readiness score
- matched skills
- matched proof
- missing skills
- missing proof
- apply recommendation:
  - apply now
  - improve first
  - watchlist

### Candidate actions

For each role:

- express interest
- save
- dismiss
- improve profile for this role
- prepare for this role

### Recruiter interconnection

Every recruiter-created JD should:

1. become searchable/matchable on candidate side
2. flow through AI parsing
3. generate candidate match scores
4. show up in recruiter requests when candidate engages

## Cross-Side Data Model Direction

These are the key product objects Pulse needs to revolve around:

### Candidate credibility profile

- identity
- skills
- goals
- proof artifacts
- verification state
- pulse score
- recruiter visibility

### Proof artifact

- type
- source
- summary
- structured metadata
- score contribution
- recruiter-facing interpretation

### Parsed job

- role title
- location
- required skills
- required experience signals
- proof preferences
- recruiter metadata

### Match object

- candidate id
- jd id
- fit score
- readiness score
- matched skills
- missing skills
- matched proof
- missing proof
- AI explanation

## Repo-Specific Build Plan

## Phase 1: Candidate Mission Control

### Goal

Make the dashboard the central credibility surface.

### Files

- `apps/web/src/app/candidate/dashboard/page.tsx`
- shared candidate card components to extract from that file
- possibly add a new candidate overview component folder

### Work

1. Rework dashboard sections around:
- credibility
- proof completeness
- recruiter readiness
- opportunity radar
- recruiter signals
- AI next actions

2. Replace generic cards with:
- clearer explanations
- stronger CTAs
- score contribution visibility

3. Make every CTA lead into:
- proof
- AI coach
- opportunities
- inbox

## Phase 2: Proof Unification

### Goal

Turn proof builder into a structured evidence system.

### Files

- `apps/web/src/app/candidate/proof/page.tsx`
- relevant proof API usage in `apps/web/src/lib/api.ts`

### Work

1. Add proof scores and recruiter value per artifact
2. Add stronger repo showcase metadata
3. Improve case study creation flow
4. Improve video pitch scoring/transcription experience
5. Add proof completeness tie-in to dashboard

## Phase 3: AI Agent Integration

### Goal

Make Copilot feel like a real career agent.

### Files

- `apps/web/src/app/candidate/copilot/page.tsx`
- dashboard CTAs
- opportunities page integration

### Work

1. Add action queue
2. Add score-gap explanation
3. Add role-targeted recommendations
4. Add proof improvement recommendations tied to real match gaps

## Phase 4: Smart Matches

### Goal

Make the opportunities page feel agentic and recruiter-connected.

### Files

- `apps/web/src/app/candidate/opportunities/page.tsx`
- recruiter JD creation/discovery APIs and pages
- `apps/web/src/lib/api.ts`

### Work

1. Add readiness score
2. Add matched proof / missing proof
3. Add apply-now vs improve-first recommendation
4. Surface recruiter-originated jobs more explicitly
5. Improve candidate engagement feedback loop

## Phase 5: Public Profile Strengthening

### Goal

Make the public candidate profile an actual recruiter-grade credibility page.

### Files

- `apps/web/src/app/profile/public/page.tsx`

### Work

1. add proof highlights
2. add featured projects
3. add verification badges
4. add score explanation
5. add recruiter-oriented summary

## Recommended Immediate Execution Order

This is the fastest path to visible product improvement:

1. Redesign `candidate/dashboard/page.tsx`
2. Add dashboard-driven proof completeness and next steps
3. Improve `candidate/opportunities/page.tsx` with readiness and missing-proof logic
4. Refactor `candidate/copilot/page.tsx` into a stronger action-oriented assistant
5. Upgrade `profile/public/page.tsx`

## What We Should Build First

The best next implementation task is:

`candidate/dashboard/page.tsx -> convert from score board into credibility mission control`

This gives the biggest product jump without requiring a full backend rewrite.

## Implementation Notes

- Avoid building new disconnected pages unless necessary.
- Prefer extracting reusable dashboard/proof/match components.
- Keep the current candidate pages, but make dashboard the main orchestration layer.
- Treat the recruiter side as the downstream consumer of candidate credibility signals.
- Keep all AI interactions tied to visible outcomes:
  - stronger profile
  - stronger proof
  - better fit
  - more recruiter trust

