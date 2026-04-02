# Light

A lightweight audience insights platform that helps marketers move from raw survey data to actionable creative output. Browse respondents, build reusable audiences, explore genre interests, and generate AI-powered creative deliverables.

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Spec Compliance](#spec-compliance)
- [Key Decisions](#key-decisions)
- [AI Use](#ai-use)

---

## Quick Start

> **Prerequisites:** Node.js 20+, Docker Desktop (running), OpenAI API key (optional)

```bash
npm install
npm run setup
```

The setup script starts Supabase, applies migrations, seeds the database, and launches the dev server at `http://localhost:3000`.

### Demo Account

| Field | Value |
|-------|-------|
| Email | `john@example.com` |
| Password | `password123` |

Pre-loaded with a "Wellness-Oriented Parents" audience, precomputed genre insights, and one example of each creative output type.

---

## Features

**Respondent Explorer** - Paginated table of survey respondents with expandable demographic detail panels and genre interest ratings.

**Audience Builder** - Create named audiences using demographic filters stored as JSON. Manual include/exclude overrides for fine-tuning. Auto-saves on every change.

**Genre Insights** - Horizontal bar chart of top genres by % highly interested, plus a full data table. Precomputed on audience create/update for fast reads.

**Creative Workflows** - Four AI-powered workflows grounded in real audience data:

| Workflow | Output |
|----------|--------|
| Audience Persona | Named persona with demographics, interests, lifestyle, and reach strategy |
| Campaign Concepts | 3-5 campaigns with taglines, target genres, and suggested formats |
| Messaging Angles | 3-5 approaches with tone, headlines, hooks, and the trait each leverages |
| Content Opportunities | White-space analysis crossing underused genres with audience traits |

All outputs auto-save, support inline editing, AI refinement (presets + freeform), and regeneration.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (strict) |
| **Database** | Supabase (PostgreSQL, local Docker) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth (email/password) |
| **State** | React Query + Zustand |
| **AI** | Vercel AI SDK + OpenAI (gpt-4o-mini) |
| **UI** | Tailwind CSS v4, shadcn/ui, Recharts |
| **Testing** | Vitest + React Testing Library (467 tests) |

### Database

Six tables with row-level security:

| Table | Purpose | Access |
|-------|---------|--------|
| `respondents`, `genres`, `respondent_genre_interests` | Seed data | SELECT-only for authenticated users |
| `audiences` | User-created segments with filter JSON | CRUD scoped to `auth.uid()` |
| `audience_genre_summaries` | Precomputed genre stats per audience | Recomputed on every audience change |
| `creative_outputs` | AI-generated content (all 4 types) | CRUD scoped to `auth.uid()` |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side service role key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | No | Enables AI creative workflows |

All auto-populated by `npm run setup`. Without the OpenAI key, creative generation is disabled but everything else works.

---

## Spec Compliance

Every requirement from the take-home spec is implemented:

The implementation context is retained as a test task baseline, with setup, requirements, and coverage notes kept close to the spec.

| Requirement | Details |
|-------------|---------|
| Respondent Explorer | Paginated table with expandable detail panels |
| Audience/Segment Builder | Filter-based with JSON persistence, manual overrides |
| Genre Insights | Bar chart + data table, precomputed summaries, correct 1-5 scale |
| Creative Workflows (2+ required) | 4 workflows: persona, campaign, messaging, opportunities |
| Persistence | Audiences, summaries, and outputs saved with RLS |
| Supabase Configuration | Local Docker via `supabase/config.toml` |
| Migrations | Schema + RLS policy migration files |
| Seed Data | 12 respondents, 10 genres, 120 interests, demo user + outputs |
| RLS Policies | Seed data read-only, user data scoped to `auth.uid()` |
| Setup Instructions | `npm run setup` one-command |
| Environment Variables | All 5 documented, auto-populated |
| Data Signal Discovery | All 4 audience clusters discoverable via filters |

### Beyond the Spec

| Feature | Description |
|---------|-------------|
| 4 workflows instead of 2 | Persona, Campaign, Messaging, and Content Opportunities |
| Inline editing | Click any text field in a creative output to edit directly |
| AI refinement | Preset buttons + freeform prompts to iterate on outputs |
| In-place regeneration | Regenerate replaces the existing output, no duplicates |
| Streaming output | AI responses stream progressively with loading overlays |
| 467 automated tests | Full coverage across 52 test files |
| Auto-save audiences | Debounced save on every filter or name change |
| Manual include/exclude | Override filter rules for specific respondents |
| Sidebar audience selector | Switch audiences from any page |
| Session state clearing | Full cache + store wipe on sign-out |

---

## Key Decisions

**Filter-based audiences over manual selection.** Filters persist as a definition (JSON), not a list of IDs. Scales to larger datasets and keeps audience membership dynamic.

**Precomputed genre summaries.** Written to a dedicated table on every audience change. Keeps the dashboard fast regardless of dataset size.

**Streaming AI generation.** Structured JSON output validated against Zod schemas via Vercel AI SDK. Auto-saved on stream completion. Refinements update in-place.

**Single-table creative outputs.** All four workflow types share one table with a `type` column and `content` JSONB. Simpler schema, Zod enforces structure at the app layer.

**Row-level security throughout.** Seed data read-only, user data scoped to `auth.uid()` at the database level.

---

## AI Use

Built with Claude Code (Anthropic's CLI tool) for planning, implementation, and iteration.

### Development Workflow

The project followed a structured AI-assisted pipeline using Claude Code skills:

1. **Brainstorm** - Interactive Q&A to explore the problem space, nail down scope, and resolve design decisions
2. **PRD creation** - Full product requirements document with user stories, functional requirements, and technical assumptions
3. **PRD to issues** - Broke the PRD into 16 independently-completable vertical slice issues with dependency tracking
4. **Ralph loop** - Autonomous execution script (`scripts/ralph.sh`) that orchestrates Claude Code in a loop: picks the next ready issue, spawns subagents in isolated git worktrees, merges results, updates statuses, and unblocks dependents

### What AI Did Well

- Scaffolding the database schema, migrations, and RLS policies from the spec
- Generating the initial component structure and API routes
- Writing test suites (467 tests across 52 files)
- Implementing the streaming AI pipeline with Zod-validated structured output
- Parallel task execution via subagents for the UI overhaul

### Where AI Stumbled

- **UI and design quality was the biggest issue.** The initial interface was functionally correct but visually poor: invisible borders (15% opacity), globally suppressed shadows, low-contrast text, overlapping chart labels. Every visual element needed manual review and specific design direction. AI defaults to "safe" choices that look generic and have contrast problems.
- **Seed data format mismatches.** AI generated seed UUIDs that looked valid to Postgres but failed Zod's RFC 4122 validation (missing version/variant bits). It also generated creative output seed data with content shapes that didn't match the Zod schemas the app used. Both required debugging to find the mismatch.

The pattern: AI is excellent at structural/functional work but consistently produces mediocre visual design and subtly incorrect data mappings. Both require human review.
