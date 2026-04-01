---
id: 015
title: Content Opportunity Finder workflow
status: In Progress
priority: 6
attempts: 1
blocked_by: ["012-persona-workflow-streaming-foundation.md"]
user_stories: [46, 47]
created: 2026-04-01
---

# Content Opportunity Finder workflow

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The streaming infrastructure and persona workflow exist (from issue 012). The Content Opportunity Finder is a unique workflow that looks for gaps rather than strengths — it cross-references genres the audience rates as neutral or low-interest with their demographic traits to find non-obvious creative opportunities.

## What to Build

**Extend the POST /api/creative route:**

Add handling for `type: "opportunity"` in the existing creative generation API route. When the type is "opportunity":

1. Fetch the audience's demographics AND the full genre insights — including the low-interest and neutral genres (interest level 3, 4, or 5), not just the top ones.
2. Use a system prompt that instructs the AI to find non-obvious creative opportunities by cross-referencing the audience's demographic traits with genres they currently show low or neutral interest in. The AI should identify where an unexpected connection exists (e.g., "This tech-savvy audience shows low interest in Cooking, but 67% are parents — family-friendly tech-cooking crossover content could be an untapped angle").
3. Stream the structured output using `streamText()` with `Output.object()`.

**Zod schema for content opportunities:**

- `opportunities` (array of objects), each containing:
  - `gapGenre` (string) — the genre name with low/neutral interest
  - `audienceTrait` (string) — the demographic trait that creates the opportunity
  - `crossoverConcept` (string) — a suggested creative concept that bridges the gap genre and the audience trait
  - `reasoning` (string) — explanation of why this opportunity exists
  - `confidence` (string — one of: "high", "medium", "low") — how strong the opportunity signal is based on the data

Use `.nullable()` for any fields that could be absent.

**Opportunity cards UI:**

Render each opportunity as a card. Each card displays:
- Gap genre as the card title or primary label
- Audience trait prominently displayed
- Crossover concept as the main body text
- Reasoning as supporting text
- Confidence indicator as a visual element (e.g., colored badge — green for high, yellow for medium, red/gray for low)

The card design should make the "gap + trait = opportunity" logic visually clear.

**Integration with streaming consumer:**

Reuse the streaming consumer pattern from issue 012. Opportunities progressively appear as the stream delivers them. On completion, auto-save and add to output history.

## Acceptance Criteria

- [ ] POST /api/creative with type "opportunity" streams structured content opportunities
- [ ] The AI receives the audience's full genre data (including low-interest genres) and demographics as context
- [ ] The streamed output conforms to the content opportunities Zod schema
- [ ] Each opportunity renders as a card with gap genre, audience trait, crossover concept, reasoning, and confidence indicator
- [ ] The confidence indicator uses color coding (green/yellow/gray or equivalent)
- [ ] The card design makes the "gap + trait = opportunity" logic visually clear
- [ ] Opportunities progressively appear as the stream delivers them
- [ ] On stream completion, the output is auto-saved and appears in output history
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `012-persona-workflow-streaming-foundation.md`

## User Stories Covered

- User story 46: See opportunities that cross-reference low-interest genres with audience traits
- User story 47: Each opportunity card shows gap genre, trait, crossover concept, and confidence indicator

## Out of Scope

- Editing or refining opportunities (covered by issue 016)
- Campaign concepts, persona, or messaging workflows
