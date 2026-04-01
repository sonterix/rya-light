---
id: 001
title: Database schema, migrations, and RLS
status: Done
priority: 1
attempts: 1
blocked_by: []
user_stories: [56, 57]
created: 2026-04-01
---

# Database schema, migrations, and RLS

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The application has Drizzle ORM configured with an empty schema at `src/db/schema/index.ts` and a working database client at `src/db/index.ts`. Supabase local dev is configured but no tables, migrations, or security policies exist yet.

## What to Build

Define all database tables for the Light application using Drizzle ORM and generate the corresponding migration. The database must support three seed-data tables and three user-data tables.

**Seed-data tables (read-only, populated from CSV):**

1. **Respondents** — stores survey respondent demographics. Fields: respondent_id (integer, primary key), wave (integer), wave_id (integer), weight (numeric), audience_category (text), age (integer), gender (text), ethnicity (text), region (text), community_type (text), marital_status (text), household_size (integer), education (text), employment_status (text), household_income_usd (integer), investable_assets_usd (integer), zip_code (text), state (text), dma (text), parent_status (text), political_affiliation (text), home_ownership (text). B-tree indexes on: audience_category, age, gender, region, state, community_type, household_income_usd, parent_status, education, employment_status, home_ownership.

2. **Genres** — stores genre definitions. Fields: genre_slug (text, primary key), genre_name (text), genre_categories (text array). Minimal indexing needed.

3. **Respondent genre interests** — maps respondents to genres with interest ratings. Fields: respondent_id (integer, FK to respondents), genre_slug (text, FK to genres), interest_level (smallint, 1-5 scale). Composite primary key on (respondent_id, genre_slug). B-tree indexes on (genre_slug, interest_level), respondent_id, and genre_slug.

**User-data tables:**

4. **Audiences** — named audience definitions with filter rules and manual overrides. Fields: id (UUID, primary key), user_id (UUID, FK to auth.users), name (text), filters (JSONB), manual_includes (integer array), manual_excludes (integer array), created_at (timestamptz), updated_at (timestamptz). B-tree index on user_id. Composite index on (user_id, updated_at DESC).

5. **Audience genre summaries** — precomputed genre statistics per audience. Fields: id (UUID, primary key), audience_id (UUID, FK to audiences), genre_slug (text, FK to genres), avg_interest (numeric), pct_highly_interested (numeric), respondent_count (integer), computed_at (timestamptz). Composite index on (audience_id, avg_interest). B-tree index on audience_id.

6. **Creative outputs** — single table with type discriminator for all AI-generated content. Fields: id (UUID, primary key), user_id (UUID, FK to auth.users), audience_id (UUID, FK to audiences), type (text — one of: persona, campaign, messaging, opportunity), content (JSONB), created_at (timestamptz), updated_at (timestamptz). B-tree index on user_id. Composite index on (audience_id, type). Composite index on (user_id, type, updated_at DESC).

**Row-Level Security policies:**

- Seed-data tables: SELECT only for authenticated users. No INSERT, UPDATE, or DELETE policies.
- Audiences: Full CRUD scoped to `user_id = auth.uid()`.
- Audience genre summaries: SELECT where `audience_id IN (SELECT id FROM audiences WHERE user_id = auth.uid())`. No client-side writes (server uses service role key).
- Creative outputs: Full CRUD scoped to `user_id = auth.uid()`.

**Cascade behavior:**
- Deleting an audience must cascade-delete its genre summaries and creative outputs.

After defining the schema, generate the migration using `drizzle-kit generate`. The migration output goes to `supabase/migrations/`. RLS policies should be included in the migration SQL or as a separate SQL file that runs during migration.

## Acceptance Criteria

- [ ] All 6 tables are defined in the Drizzle schema with correct column types, primary keys, and foreign keys
- [ ] All specified B-tree and composite indexes are created
- [ ] Cascade delete is configured from audiences to genre summaries and creative outputs
- [ ] Migration file is generated and applies cleanly against a fresh local Supabase instance
- [ ] RLS is enabled on all 6 tables
- [ ] Seed-data tables allow SELECT for authenticated users and deny all writes
- [ ] User-data tables (audiences, creative_outputs) allow full CRUD only for rows where user_id matches the authenticated user
- [ ] Audience genre summaries allow SELECT only through audience ownership verification and deny client-side writes
- [ ] Schema exports types via Drizzle's InferSelectModel and InferInsertModel for use by other layers
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

None — can start immediately.

## User Stories Covered

- User story 56: As a marketer, I want my audiences and creative outputs to be visible only to me
- User story 57: As a marketer, I want to be unable to see, edit, or delete another user's audiences or creative outputs

## Out of Scope

- Seed data insertion (covered by issue 002)
- API routes that query these tables
- UI components
