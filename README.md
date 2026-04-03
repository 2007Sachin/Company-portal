# 🟣 Pulse — Candidate App

> Replace your static resume with a live, verifiable Pulse Score.

**Project Pulse** is a real-time developer activity platform that aggregates data from GitHub, LeetCode, and Medium to create a dynamic **Pulse Score** that recruiters can trust.

## 🎯 The Problem

The Indian early-career tech recruitment market suffers from "Resume Stagnation" — millions of graduates submit identical, unverifiable resumes. Pulse solves this with **Activity-as-Pedigree**: instead of what candidates *claim*, show what they're *demonstrably doing*.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Storage | Supabase Storage |
| Deployment | Vercel |

## 📁 Project Structure

```
pulse-candidate-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout
│   │   ├── globals.css                       # Design system
│   │   ├── auth/
│   │   │   ├── login/page.tsx                # Login page
│   │   │   ├── signup/page.tsx               # Signup page
│   │   │   └── callback/route.ts             # OAuth callback
│   │   ├── onboarding/
│   │   │   ├── step-1/page.tsx               # Who You Are
│   │   │   ├── step-2/page.tsx               # Proof of Work
│   │   │   ├── step-3/page.tsx               # Career Path
│   │   │   ├── step-4/page.tsx               # Privacy & Trust
│   │   │   └── step-5/page.tsx               # Launch Profile
│   │   ├── dashboard/page.tsx                # Main dashboard
│   │   ├── profile/public/page.tsx           # Public profile
│   │   └── api/
│   │       ├── profile/route.ts              # Profile CRUD
│   │       ├── pulse-score/route.ts          # Score API
│   │       └── integrations/
│   │           ├── github/callback/route.ts  # GitHub OAuth
│   │           └── leetcode/route.ts         # LeetCode verify
│   ├── components/
│   │   ├── ui/                               # Reusable UI components
│   │   │   ├── button.tsx, input.tsx, select.tsx
│   │   │   ├── chip.tsx, avatar.tsx
│   │   │   ├── card.tsx, progress.tsx
│   │   │   └── index.ts
│   │   └── layout/                           # Layout components
│   │       ├── sidebar.tsx
│   │       ├── onboarding-shell.tsx
│   │       └── preview-panel.tsx
│   ├── lib/
│   │   ├── supabase.ts                       # Supabase client
│   │   └── utils.ts                          # Helper functions
│   └── types/
│       └── index.ts                          # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql            # Database schema
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local.example
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd pulse-candidate-app
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key

### 3. Set Up Database

Run the migration in your Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎨 Design System

The Pulse design system uses an **Indigo/Purple** color palette with a dark theme:

- **Primary**: `#6366f1` (Indigo 500)
- **Surface**: `#0f172a` (Slate 900)
- **Text**: `#f8fafc` (Slate 50)
- **Fonts**: Inter (body), Outfit (display)

## 📊 Key Features

- **5-Step Onboarding**: Who You Are → Proof of Work → Career Path → Privacy → Launch
- **Pulse Score**: Real-time score based on Velocity, Consistency, Breadth, and Impact
- **Platform Integrations**: GitHub OAuth, LeetCode verification, Medium RSS
- **Live Profile**: Public, shareable profile with activity timeline
- **Privacy Controls**: DPDP Act compliant with granular visibility settings
- **Anti-Gaming**: Time decay, daily caps, anomaly detection

## 👥 Target Users

| Persona | Description |
|---------|-------------|
| **Rahul** (Student) | Tier-3 college CS student with strong GitHub/LeetCode, wants to escape college-brand bias |
| **Priya** (Recruiter) | Senior TA at a SaaS startup, drowning in identical resumes, needs to find proven coders |

## 📈 Success Metrics

- 40% reduction in Time-to-Hire
- 60% technical round pass rate
- 75% of users with 2+ verified integrations

---

Built with 💜 by the Pulse team
