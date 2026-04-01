---
id: 010
title: Genre insights computation and visualization
status: Blocked
priority: 4
attempts: 0
blocked_by: ["007-audience-builder-create-list.md"]
user_stories: [26, 27, 28, 29, 30]
created: 2026-04-01
---

# Genre insights computation and visualization

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The audience builder exists (from issue 007) and users can create and select audiences. The dashboard needs to show what genres the selected audience cares about, powered by precomputed data for performance at scale.

## What to Build

**Genre summary computation logic:**

Create a server-side function that computes genre statistics for a given audience. For each genre:

1. Identify all respondents in the audience (applying filters + manual includes - manual excludes).
2. Collect their interest_level ratings for that genre from the respondent_genre_interests table.
3. Calculate the **average interest score** (lower is better — 1 = highest interest, 5 = unfamiliar).
4. Calculate the **percentage highly interested** — the percentage of audience members who rated 1 or 2 for that genre.
5. Store the respondent count for that genre.

Write the results to the audience_genre_summaries table, replacing any previous summaries for that audience. Record the computation timestamp.

**Computation triggers:**

The genre summary must be recomputed whenever:
- A new audience is created (hook into the POST /api/audiences flow)
- An existing audience is updated — filters, manual includes, or manual excludes change (hook into the PATCH /api/audiences flow)

The computation runs synchronously within the API request using the service role key to write to the summaries table (since RLS blocks client-side writes to this table).

**API route:**

`GET /api/audiences/[id]/insights` — Returns the precomputed genre summaries for the specified audience. Results are sorted by avg_interest ascending (most interested genres first). Requires authentication and verifies the audience belongs to the current user (via the audience ownership chain). Returns genre_slug, genre_name, avg_interest, pct_highly_interested, and respondent_count for each genre.

**Genre insights UI on the dashboard:**

When an audience is selected on the dashboard, display a horizontal bar chart below the audience cards section:

1. Show the **top 5 genres** ranked by average interest score (lowest = most interested).
2. Each bar represents one genre. The bar length corresponds to the percentage of highly interested members.
3. Each bar label shows: genre name, the average interest score, and the % highly interested (e.g., "Cooking / Baking — Avg: 1.3 — 100% highly interested").
4. Below the chart, a "Show more" button reveals all remaining genres in the same bar chart format.
5. If no audience is selected, show a message prompting the user to select or create one.

Use the charting library installed in issue 005.

## Acceptance Criteria

- [ ] Genre summaries are correctly computed: average interest score and % highly interested match manual calculation for the test data
- [ ] Summaries are written to the audience_genre_summaries table with the correct audience_id and genre_slug
- [ ] Summaries are recomputed when an audience is created via POST /api/audiences
- [ ] Summaries are recomputed when an audience is updated via PATCH /api/audiences
- [ ] GET /api/audiences/[id]/insights returns genre summaries sorted by avg_interest ascending
- [ ] The API route verifies audience ownership before returning data
- [ ] The dashboard displays a horizontal bar chart of the top 5 genres when an audience is selected
- [ ] Each bar shows the genre name, average interest score, and % highly interested
- [ ] A "Show more" button reveals all remaining genres
- [ ] A prompt appears when no audience is selected
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `007-audience-builder-create-list.md`

## User Stories Covered

- User story 26: See a horizontal bar chart of top 5 genres by average interest
- User story 27: Each bar shows % of audience that is highly interested
- User story 28: "Show more" button reveals remaining genres
- User story 29: Genre insights load from precomputed data
- User story 30: Genre insights recompute when audience is updated

## Out of Scope

- Genre filtering or searching
- Genre detail pages
- Comparing genres across audiences
