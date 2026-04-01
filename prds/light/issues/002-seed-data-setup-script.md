---
id: 002
title: Seed data and setup script
status: Done
priority: 2
attempts: 1
blocked_by: ["001-database-schema-migrations-rls.md"]
user_stories: [58, 59, 60, 61, 62]
created: 2026-04-01
---

# Seed data and setup script

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The database schema and migrations exist (from issue 001). The application needs seed data from provided CSV files and a one-command setup experience for reviewers.

## What to Build

**Seed SQL file:**

Create a seed file that Supabase executes during `supabase db reset`. It must insert:

1. A pre-created demo user in Supabase Auth with email `john@example.com` and password `password123`.
2. All 12 respondents from the provided respondents CSV (fields: respondent_id, wave, wave_id, weight, audience_category, age, gender, ethnicity, region, community_type, marital_status, household_size, education, employment_status, household_income_usd, investable_assets_usd, zip_code, state, dma, parent_status, political_affiliation, home_ownership).
3. All 10 genres from the provided genres CSV (fields: genre_slug, genre_name, genre_categories — note: genre_categories is pipe-delimited in the CSV and must be converted to a text array).
4. All 120 respondent genre interest ratings from the provided CSV (fields: respondent_id, genre_slug, interest_level).
5. One sample audience named "Wellness-Oriented Parents" for the demo user, with a filter on audience_category equals "Wellness-Oriented Parents" (matching 3 respondents: IDs 1004, 1005, 1006).
6. Precomputed genre summaries for that sample audience, calculated from the actual interest data for those 3 respondents.
7. One pre-generated creative output for each of the 4 workflow types (persona, campaign, messaging, opportunity) for that sample audience, with realistic placeholder content in the JSONB content field.

**Setup script:**

Create a shell script and corresponding npm command (`npm run setup`) that:

1. Prompts the user to enter their OpenAI API key (with the option to press Enter to skip).
2. Starts Supabase via Docker (`supabase start`).
3. Captures Supabase credentials from `supabase status` output (URL, anon key, service role key).
4. Writes a `.env.local` file with all captured Supabase values, the database URL, and the OpenAI key (if provided). If `.env.local` already exists, it should be overwritten.
5. Runs `supabase db reset` to apply migrations and execute the seed file.
6. Starts the development server (`npm run dev`).

The reviewer experience should be: clone the repo, run `npm run setup`, enter their OpenAI key (or skip), and have a fully working app with a demo account they can sign into immediately.

## Acceptance Criteria

- [ ] Seed file inserts the demo user into Supabase Auth with the documented credentials
- [ ] All 12 respondents, 10 genres, and 120 interest ratings are inserted from CSV data
- [ ] Genre categories are stored as text arrays (pipe-delimited values split correctly)
- [ ] One sample audience exists for the demo user with correct filter configuration
- [ ] Genre summaries for the sample audience are precomputed with accurate avg_interest and pct_highly_interested values
- [ ] Four sample creative outputs exist (one per workflow type) for the sample audience
- [ ] Running `npm run setup` prompts for OpenAI key and proceeds whether or not a key is entered
- [ ] The setup script starts Supabase, captures credentials, writes .env.local, seeds the database, and starts the dev server in sequence
- [ ] A reviewer can sign in as john@example.com / password123 after setup completes
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `001-database-schema-migrations-rls.md`

## User Stories Covered

- User story 58: As a reviewer, I want to run a single command to start the entire application
- User story 59: As a reviewer, I want the setup script to prompt me for my OpenAI API key
- User story 60: As a reviewer, I want the setup script to skip the OpenAI key if I press Enter
- User story 61: As a reviewer, I want a pre-created demo account with sample data
- User story 62: As a reviewer, I want the demo account to have one sample audience with precomputed genre insights and one of each creative output type

## Out of Scope

- Database schema definition (covered by issue 001)
- Auth UI (covered by issue 004)
- Production deployment scripts
