---
id: 006
title: Respondent explorer page
status: Done
priority: 3
attempts: 1
blocked_by: ["001-database-schema-migrations-rls.md", "005-app-shell-sidebar-providers.md"]
user_stories: [7, 8, 9, 10, 11]
created: 2026-04-01
---

# Respondent explorer page

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The database schema with respondent data exists (from issue 001), and the app shell with sidebar navigation is in place (from issue 005). The `/respondents` page needs to be built.

## What to Build

**API routes:**

1. `GET /api/respondents` — Returns a paginated list of respondents. Accepts a `page` query parameter (defaults to 1). Returns a fixed page size (e.g., 10 per page). Response includes the respondent records and pagination metadata (current page, total pages, total count). Each respondent in the list includes only the summary fields: respondent_id, audience_category, age, gender, region, state, household_income_usd. Requires authentication.

2. `GET /api/respondents/[id]` — Returns a single respondent with ALL fields plus their genre interest ratings. The genre interests should include the genre name (not just the slug) and the interest level. Requires authentication.

Both routes must validate input with Zod and return consistent response shapes (`{ data }` on success, `{ error }` on failure).

**React Query hooks:**

Create hooks that wrap the API calls: one for the paginated respondent list (keyed by page number) and one for a single respondent's full details.

**Respondent table UI:**

Build the `/respondents` page with a data table showing 6 columns:

| Column | Data |
|--------|------|
| ID | respondent_id |
| Audience Category | audience_category |
| Age | age |
| Gender | gender |
| Location | region + state combined (e.g., "West, CA") |
| Household Income | household_income_usd formatted as currency (e.g., "$118,000") |

**Expandable detail rows:**

Each row is expandable. Clicking a row reveals a detail panel below it showing all remaining respondent fields organized into logical groups: demographic details, geographic details, household details, socioeconomic details, and survey metadata (wave, wave_id, weight). The detail panel also shows the respondent's genre interests as a list with genre name and interest level.

**URL-based pagination:**

The table uses page number pagination driven by URL search params (e.g., `/respondents?page=3`). Page numbers are displayed below the table. Changing pages updates the URL, making pages shareable and bookmarkable. The React Query hook reads the page from the URL params.

**Loading and empty states:**

While data is loading, show skeleton rows matching the table layout. If no respondents exist, show a contextual empty state message.

## Acceptance Criteria

- [ ] GET /api/respondents returns paginated respondent summaries with correct page metadata
- [ ] GET /api/respondents/[id] returns full respondent details including genre interests with genre names
- [ ] Both API routes validate input with Zod and return consistent response shapes
- [ ] The respondent table displays 6 columns: ID, Audience Category, Age, Gender, Location, Household Income
- [ ] Household income is formatted as currency
- [ ] Location combines region and state
- [ ] Clicking a row expands a detail panel showing all remaining fields and genre interests
- [ ] Pagination is driven by URL search params and page numbers are displayed below the table
- [ ] Changing pages updates the URL without a full page reload
- [ ] Skeleton rows appear while data is loading
- [ ] An empty state message appears when no respondents exist
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `001-database-schema-migrations-rls.md`
- `005-app-shell-sidebar-providers.md`

## User Stories Covered

- User story 7: Browse respondents in a table with summary columns
- User story 8: Expand a row to see full details
- User story 9: Paginate with URL-based page numbers
- User story 10: See skeleton loading states
- User story 11: See an empty state when no respondents exist

## Out of Scope

- Search bar on the respondent table
- Filtering respondents (that's the audience builder)
- Respondent data editing
