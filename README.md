# Light

A lightweight audience insights platform that helps marketers move from raw survey data to actionable creative output. Browse respondents, build reusable audiences, explore genre interests, and generate AI-powered campaign concepts, persona snapshots, messaging angles, and white-space opportunities.

## Quick Start

**Prerequisites**

- Node.js 20+
- Docker Desktop (running)
- An OpenAI API key (optional, required for AI creative workflows)

**One command setup**

```bash
npm install
npm run setup
```

The setup script will:

1. Prompt for your OpenAI API key (press Enter to skip)
2. Start Supabase via Docker
3. Capture credentials and write `.env.local`
4. Run migrations and seed the database
5. Start the dev server at `http://localhost:3000`

**Demo account:** `john@example.com` / `password123`

The demo account comes pre-loaded with a "Wellness-Oriented Parents" audience, precomputed genre insights, and one example of each creative output type.

## What It Does

### Respondent Explorer

Paginated table of all survey respondents showing audience category, age, gender, region, and income. Click any row to expand full demographic details and genre interest ratings.

### Audience Builder

Create named audiences using demographic filters (audience category, age range, gender, region, plus advanced filters for state, community type, income, education, employment, parent status, home ownership). Filters are stored as JSON in Supabase. Manual include/exclude overrides let you fine-tune membership beyond filter rules.

**Why filter-based:** Filter sets are reusable, composable, and scale to larger datasets. They persist as a definition, not a snapshot, so audience membership updates automatically as new respondents are added.

### Genre Insights

Horizontal bar chart showing the top genres by percentage of the audience that rated them highly interested (score 1 or 2). A full data table below shows all genres with their average interest score.

Interest scale: `1` = highest interest, `2` = interested, `3` = neutral, `4` = low interest, `5` = unfamiliar.

Genre summaries are precomputed on audience create/update and served from a summary table for fast reads.

### Creative Workflows

Four AI-powered workflows, each grounded in the selected audience's real demographic and genre data:

| Workflow | What it generates |
|----------|------------------|
| **Audience Persona** | A named persona with demographic summary, top interests, lifestyle description, and reach strategy |
| **Campaign Concepts** | 3-5 campaign ideas with taglines, descriptions, target genres, and suggested formats |
| **Messaging Angles** | 3-5 messaging approaches with tone, sample headlines, emotional hooks, and the audience trait each leverages |
| **Content Opportunities** | White-space analysis crossing underused genres with audience traits to find non-obvious creative angles |

All outputs are saved to Supabase automatically. Each output supports inline editing, preset refinement buttons, freeform AI refinement prompts, and full regeneration.

### Persistence

Audiences, genre summaries, and all creative outputs are saved to Supabase with row-level security scoped to the authenticated user. Outputs can be revisited, edited, refined, or deleted across sessions.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL, local Docker) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email/password) |
| State | React Query (server state), Zustand (UI state) |
| AI | Vercel AI SDK + OpenAI (gpt-4o-mini) |
| UI | Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Testing | Vitest + React Testing Library |

### Database Schema

Six tables with RLS policies:

- **respondents** / **genres** / **respondent_genre_interests** - Seed data tables. SELECT-only for authenticated users.
- **audiences** - User-created segments with filter JSON, manual includes/excludes. CRUD scoped to `auth.uid()`.
- **audience_genre_summaries** - Precomputed genre stats per audience. Recomputed on every audience change.
- **creative_outputs** - AI-generated content with type discriminator. CRUD scoped to `auth.uid()`.

### Project Structure

```
src/
  app/              Pages, layouts, API routes (Next.js App Router)
  components/
    ui/             shadcn/ui primitives
    shared/         Sidebar, providers
    audience/       Audience cards, grid, filters, chart, edit sheet
    creative/       Output cards, refinement panel, workflow selector
    respondents/    Table, detail panel, pagination
  db/schema/        Drizzle table definitions (single source of truth for types)
  hooks/            React Query hooks, generate hooks, auto-select
  stores/           Zustand store (selected audience)
  lib/              Filter matching, genre computation, Zod schemas, Supabase clients
  types/            Shared TypeScript interfaces
supabase/
  migrations/       SQL migrations (schema + RLS policies)
  seed.sql          Demo user, respondents, genres, interests, sample audience + outputs
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | No | OpenAI API key for creative workflows |

All variables are automatically populated by `npm run setup`. If the OpenAI key is skipped, the creative page shows a notice and generation buttons are disabled. All other features work without it.

## Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Full setup: Supabase + seed + dev server |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `supabase start` | Start local Supabase |
| `supabase stop` | Stop local Supabase |
| `supabase db reset` | Re-run migrations + seed |

## Key Decisions

**Filter-based audiences over manual selection.** Filters persist as a definition (JSON), not a list of IDs. This scales to larger datasets and keeps audience membership dynamic. Manual include/exclude overrides handle edge cases without abandoning the filter model.

**Precomputed genre summaries.** Rather than computing genre stats on every page load, summaries are written to a dedicated table whenever an audience is created or updated. This keeps the dashboard fast regardless of dataset size.

**Streaming AI generation.** Creative outputs stream progressively via the Vercel AI SDK, with structured JSON output validated against Zod schemas. Outputs are auto-saved on stream completion. Refinements update in-place rather than creating duplicates.

**Single-table creative outputs with type discriminator.** All four workflow types share one `creative_outputs` table with a `type` column and a `content` JSONB column. Simpler schema, easier queries, and the Zod schemas enforce structure at the application layer.

**Row-level security throughout.** Seed data is read-only for all authenticated users. User-created data (audiences, summaries, outputs) is scoped to `auth.uid()` at the database level, not just the application layer.

## AI Use

This project was built using Claude Code (Anthropic's CLI tool) for planning, implementation, and iteration.

**What AI did well:**

- Scaffolding the database schema, migrations, and RLS policies from the spec
- Generating the initial component structure and API routes
- Writing test suites (467 tests across 52 files)
- Implementing the streaming AI pipeline with Zod-validated structured output
- Parallel task execution via subagents for the UI overhaul

**Where AI stumbled and required course-correction:**

- **UI and design quality was the biggest issue.** The initial AI-generated interface was functionally correct but visually poor: invisible borders (15% opacity), globally suppressed shadows, low-contrast text, and overlapping chart labels. Every visual element needed manual review and specific design direction. AI defaults to "safe" design choices that look generic and often have contrast/readability problems.
- **Seed data format mismatches.** AI generated seed UUIDs that looked valid to Postgres but failed Zod's RFC 4122 validation (missing version/variant bits). It also generated creative output seed data with content shapes that didn't match the Zod schemas the app actually used. Both required debugging to find the mismatch.
- **Filter option values didn't match actual data.** AI hardcoded filter dropdown options ("Tech Enthusiasts", "Budget Shoppers") that didn't match the actual CSV categories ("Emerging Tech Professionals", "Competitive Sports Fans"). Same issue with education levels, employment statuses, and home ownership values.
- **Interest scale confusion.** The initial prompts and opportunity analysis had the 1-5 interest scale inverted, treating high scores as high interest. Required manual correction to align with the spec (1=highest, 5=unfamiliar).
- **State management coupling.** AI initially tied audience selection and the edit sheet to the same Zustand state, so selecting an audience always opened the edit panel. Required separation into distinct "selected" vs "editing" states.

The pattern: AI is excellent at structural/functional work but consistently produces mediocre visual design and subtly incorrect data mappings. Both require human review.
