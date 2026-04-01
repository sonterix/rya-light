---
id: 013
title: Campaign Concepts workflow
status: Blocked
priority: 6
attempts: 0
blocked_by: ["012-persona-workflow-streaming-foundation.md"]
user_stories: [42, 43]
created: 2026-04-01
---

# Campaign Concepts workflow

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The streaming infrastructure and persona workflow exist (from issue 012). The same streaming pattern needs to be applied to the Campaign Concepts workflow — a different creative output type with its own schema and prompt.

## What to Build

**Extend the POST /api/creative route:**

Add handling for `type: "campaign"` in the existing creative generation API route. When the type is "campaign":

1. Fetch the audience's demographics and genre insights (same data fetching as persona).
2. Use a system prompt that instructs the AI to generate 3-5 campaign concepts tailored to the audience. Each concept should clearly leverage specific genres the audience cares about and be informed by their demographic profile.
3. Stream the structured output using `streamText()` with `Output.object()`.

**Zod schema for campaign concepts:**

- `concepts` (array of 3-5 objects), each containing:
  - `name` (string) — a creative campaign name
  - `tagline` (string) — a short, punchy tagline
  - `description` (string) — 2-3 sentence description of the campaign concept
  - `targetGenres` (array of strings) — the genre names this concept leverages from the audience's interests
  - `suggestedFormat` (string) — recommended content format (e.g., video series, social campaign, podcast sponsorship)

Use `.nullable()` for any fields that could be absent.

**Campaign concept cards UI:**

Render each generated concept as its own card within the creative page. Each card displays:
- Concept name as the card title
- Tagline in a prominent, styled format (e.g., italic or larger text)
- Description as body text
- Target genres as colored tag/badge pills, visually linking the concept to the audience's actual interests
- Suggested format as a subtle label or footer element

The cards should be arranged vertically or in a grid, following the design system.

**Integration with streaming consumer:**

Reuse the streaming consumer pattern established in issue 012. The client progressively renders concept cards as the AI generates them (concepts appear one by one as the array populates). On completion, auto-save and add to output history.

## Acceptance Criteria

- [ ] POST /api/creative with type "campaign" streams 3-5 structured campaign concepts
- [ ] The AI receives actual audience demographics and genre interests as context
- [ ] The streamed output conforms to the campaign concepts Zod schema
- [ ] Each concept renders as a card with name, tagline, description, genre tags, and suggested format
- [ ] Genre tags visually connect the concept to the audience's interests (not generic labels)
- [ ] Concepts progressively appear as the stream delivers them
- [ ] On stream completion, the output is auto-saved and appears in output history
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `012-persona-workflow-streaming-foundation.md`

## User Stories Covered

- User story 42: Generate 3-5 campaign concepts with name, tagline, description, genres, and format
- User story 43: Each concept displayed as a card with genre tags linking to audience interests

## Out of Scope

- Editing or refining campaign concepts (covered by issue 016)
- Messaging angles, persona, or opportunity workflows
