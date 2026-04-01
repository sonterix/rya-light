---
id: 014
title: Messaging Angles workflow
status: In Progress
priority: 6
attempts: 1
blocked_by: ["012-persona-workflow-streaming-foundation.md"]
user_stories: [44, 45]
created: 2026-04-01
---

# Messaging Angles workflow

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The streaming infrastructure and persona workflow exist (from issue 012). The same streaming pattern needs to be applied to the Messaging Angles workflow — a different creative output type with its own schema and prompt.

## What to Build

**Extend the POST /api/creative route:**

Add handling for `type: "messaging"` in the existing creative generation API route. When the type is "messaging":

1. Fetch the audience's demographics and genre insights.
2. Use a system prompt that instructs the AI to generate 3-5 distinct messaging angles for communicating with this audience. Each angle should be grounded in a specific audience trait or genre interest — not generic marketing advice.
3. Stream the structured output using `streamText()` with `Output.object()`.

**Zod schema for messaging angles:**

- `angles` (array of 3-5 objects), each containing:
  - `name` (string) — a short, descriptive name for the angle (e.g., "The Empowerment Play")
  - `tone` (string) — the emotional tone descriptor (e.g., "warm and encouraging", "bold and direct")
  - `sampleHeadline` (string) — an example headline or hook using this angle
  - `emotionalHook` (string) — the underlying emotional trigger this angle taps into
  - `keyTrait` (string) — the specific audience genre interest or demographic trait this angle leverages

Use `.nullable()` for any fields that could be absent.

**Messaging angle cards UI:**

Render each generated angle as its own card. Each card displays:
- Angle name as the card title
- Tone as a styled descriptor (e.g., with a subtle color treatment or icon)
- Sample headline in a prominent, styled format
- Emotional hook as supporting text
- Key trait highlighted with a distinct visual treatment (e.g., a badge or callout) showing the specific genre or demographic connection

The cards should make the connection between the messaging suggestion and the audience data transparent and obvious.

**Integration with streaming consumer:**

Reuse the streaming consumer pattern from issue 012. Angles progressively appear as the stream delivers them. On completion, auto-save and add to output history.

## Acceptance Criteria

- [ ] POST /api/creative with type "messaging" streams 3-5 structured messaging angles
- [ ] The AI receives actual audience demographics and genre interests as context
- [ ] The streamed output conforms to the messaging angles Zod schema
- [ ] Each angle renders as a card with name, tone, sample headline, emotional hook, and key trait
- [ ] The key trait visually highlights the specific genre or demographic connection
- [ ] Angles progressively appear as the stream delivers them
- [ ] On stream completion, the output is auto-saved and appears in output history
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `012-persona-workflow-streaming-foundation.md`

## User Stories Covered

- User story 44: Generate 3-5 messaging angles with name, tone, headline, hook, and key trait
- User story 45: Each angle displayed as a card with the genre/trait connection highlighted

## Out of Scope

- Editing or refining messaging angles (covered by issue 016)
- Campaign concepts, persona, or opportunity workflows
