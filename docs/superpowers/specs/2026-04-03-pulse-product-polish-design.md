# Pulse Candidate App Product Polish Design

**Date:** 2026-04-03  
**Project:** `pulse-candidate-app`  
**Scope:** Deep polish (UX, accessibility, performance, route-level refactor) with mock/demo data retained

## 1. Goal

Deliver a deep frontend polish pass that significantly improves usability, accessibility, maintainability, and perceived quality while preserving current mock/demo behavior and route structure.

## 2. Non-Goals

- Implementing real backend data integration for auth/profile/integrations/pulse scoring
- Changing product flow or onboarding step sequence
- Full visual redesign or branding pivot
- Database or API contract changes

## 3. Current State Summary

The app has strong visual direction and broad route coverage, but quality issues are concentrated in:

- Repeated page-level markup and inline icon blocks
- Accessibility gaps across forms, toggles, icon controls, and landmarks
- Visual inconsistencies and low-contrast secondary text in some states
- Large inline mock data objects inside route components
- Inconsistent component ergonomics for future extension

## 4. Design Principles

- Keep behavior stable: mock/demo functionality must continue to work exactly as today
- Improve interaction quality first: keyboard, focus, semantics, and readable contrast
- Reduce duplication: shared composition primitives over repeated JSX
- Keep scope controlled: light visual refresh, not net-new product features
- Prefer reversible, layered refactors: foundations -> components -> routes -> QA

## 5. Architecture and File Boundaries

### 5.1 Foundations

`src/app/globals.css`

- Consolidate design tokens for color, typography, spacing, radius, and motion
- Add explicit accessibility tokens and utility classes for:
  - Focus ring visibility
  - Contrast-safe text variants
  - Reduced-motion behavior
- Normalize reusable utility classes used across routes

### 5.2 UI Primitives

`src/components/ui/*`

- Harden component semantics and prop behavior:
  - `Button`: consistent disabled/loading/focus handling, optional accessible labels
  - `Input`/`Textarea`/`Select`: robust label and `aria-describedby` behavior for hint/error
  - `Chip`/`ChipGroup`: selection semantics and keyboard-friendly control behavior
  - `Card`/`TipCard`/`MetricCard`: improved heading and text hierarchy consistency
  - `Avatar`/`AvatarUpload`: safer fallback handling and accessible upload affordances
  - `Progress` components: readable labeling and reduced-motion compliance
- Keep current public interfaces where possible to avoid route breakage

### 5.3 Layout Primitives

`src/components/layout/*` plus new shared brand/section components

- Improve landmark semantics in onboarding shell/sidebar/preview
- Add global skip link + main-content anchor strategy
- Extract duplicated brand/logo/navigation fragments into reusable components
- Reduce repetitive structure in auth/dashboard/profile routes

### 5.4 Mock Data Boundary

New modules under `src/lib/mock/*`

- Move large inline mock objects from route files into focused mock data modules
- Keep route behavior unchanged while improving readability and maintainability
- Prepare a future backend swap by isolating demo data from UI composition

### 5.5 Route-Level Composition

`src/app/page.tsx`, `src/app/auth/*`, `src/app/onboarding/step-*/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/profile/public/page.tsx`

- Convert pages into thin composition layers
- Reuse shared sections for repeated UI patterns (metrics, activity, platform cards, profile summary blocks)
- Preserve current content and flow, with light visual improvements

## 6. UX and Accessibility Design

### 6.1 Semantic Landmarks and Heading Structure

- Enforce one primary `h1` per page
- Ensure predictable use of `header`, `nav`, `main`, `section`, and `footer`
- Remove interactive affordances from non-interactive elements

### 6.2 Keyboard and Focus

- Provide clear focus visibility on all actionable controls
- Verify logical tab order on all major routes
- Ensure no keyboard traps in onboarding and auth screens
- Add skip link support for quick keyboard navigation

### 6.3 Form Accessibility

- Guarantee label-to-control association for all form fields
- Connect hint/error text via `aria-describedby`
- Surface field error state using `aria-invalid`
- Improve required/optional signaling in form copy

### 6.4 Toggle and Icon Control Semantics

- Convert privacy toggles to accessible switch semantics (`role="switch"` + checked state)
- Ensure icon-only controls include accessible names
- Improve loading/disabled announcements for assistive technologies

### 6.5 Contrast and Readability

- Tune muted text and low-emphasis text colors for better readability on dark surfaces
- Ensure chips/badges/metadata meet practical contrast expectations
- Maintain Pulse identity with restrained visual refresh

### 6.6 Motion and Reduced Motion

- Respect `prefers-reduced-motion` for floating/pulsing/entry effects
- Preserve meaningful but minimal motion for default mode

## 7. Performance Strategy

- Extract repeated heavy JSX fragments into shared components
- Move static arrays/mock datasets out of route render bodies
- Keep client component boundaries minimal (client-only where hooks/state require it)
- Avoid unnecessary animation/paint-heavy styles on frequently rendered blocks
- Retain current bundle strategy while reducing duplication overhead

## 8. Error Handling and Robustness

- Improve defensive UI handling for absent/partial mock data
- Prevent unsafe assumptions in avatar/name/metadata rendering
- Replace dead-end `href="#"` interactions with safer non-navigation controls where appropriate
- Standardize fallback content patterns for empty states

## 9. Testing and Verification Plan

### 9.1 Automated

- `next build` for compile/type/build integrity
- Basic lint pass when lint config is available and non-interactive

### 9.2 Manual UX/A11y Verification

- Keyboard-only pass for:
  - Landing
  - Auth (login/signup)
  - Onboarding (all steps)
  - Dashboard
  - Public profile
- Screen-reader sanity checks:
  - Control naming
  - Form error association
  - Toggle state exposure
- Responsive checks (mobile + desktop)
- Reduced-motion behavior checks

### 9.3 Regression Guardrails

- Verify route navigation and step progression unchanged
- Verify all mock values render as before (except stylistic/semantic improvements)
- Verify no route-level runtime errors in static generation/build

## 10. Rollout Sequence

1. Foundations (`globals.css`, shared tokens/utilities, focus/motion/contrast)
2. UI primitive hardening (`src/components/ui/*`)
3. Layout and shared composition extraction (`src/components/layout/*`, new shared components)
4. Route-level refactor and light visual refresh (`src/app/*`)
5. Verification pass (build + manual a11y/responsive/perf smoke checks)

## 11. Risks and Mitigations

- Risk: large route refactors introduce visual regressions  
  Mitigation: phased file-by-file migration and build verification between phases

- Risk: accessibility fixes alter expected interactions  
  Mitigation: keyboard and control behavior checks per route

- Risk: scope creep toward full redesign  
  Mitigation: enforce light redesign constraint and preserve existing flow/copy intent

## 12. Acceptance Criteria

- All current routes continue to function with mock/demo data
- Noticeably cleaner, more consistent UI with light redesign only
- Stronger accessibility baseline: landmarks, form semantics, switch semantics, focus visibility, keyboard navigation
- Reduced duplication and clearer code boundaries for routes and mock data
- Successful production build and route rendering after refactor
