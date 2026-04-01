---
id: 016
title: Creative output editing
status: Blocked
priority: 6
attempts: 0
blocked_by: ["012-persona-workflow-streaming-foundation.md"]
user_stories: [48, 49, 50, 51, 52]
created: 2026-04-01
---

# Creative output editing

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

At least one creative workflow exists with streaming and auto-save (from issue 012). Users can generate and view creative outputs. Now they need the ability to refine and edit those outputs — through regeneration, direct text editing, preset AI refinements, and freeform AI prompts.

## What to Build

**API route:**

`PATCH /api/creative/[id]` — Updates an existing creative output. Accepts partial updates to the `content` JSONB field. Verifies ownership. Updates the `updated_at` timestamp. Returns the updated record. This handles both manual edits and AI-assisted refinements (the client sends the updated content regardless of how it was produced).

`GET /api/creative/[id]` — Returns a single creative output with full content. Verifies ownership.

Both routes require authentication, verify ownership, validate input with Zod, and return consistent response shapes.

**Regenerate:**

Each creative output card displays a "Regenerate" button. Clicking it triggers a new POST /api/creative call with the same audience_id and type, producing a completely fresh generation via streaming. The new output replaces the old one in the UI (or is saved as a new output — the old one remains in history). A confirmation prompt should appear before regenerating.

**Inline text editing:**

All text fields within a creative output card are directly editable. Clicking on a text field (name, description, tagline, headline, etc.) switches it into an editable state (e.g., a contenteditable element or an input field). The user can modify the text and click away or press Enter to confirm. Changes are auto-saved via PATCH to the content JSONB.

**Preset refinement buttons:**

Each workflow type has its own set of preset refinement buttons displayed alongside the output. When clicked, a preset sends the current output content plus a refinement instruction to the AI, which streams back an updated version.

Presets per workflow type:

- **Persona**: "Add more detail", "Make it shorter", "Focus on lifestyle habits", "Focus on media consumption", "Emphasize demographics"
- **Campaign Concepts**: "Make it bolder", "Make it safer", "Add more detail", "Make it shorter", "Focus on [genre]", "Target different format"
- **Messaging Angles**: "Make it more emotional", "Make it more data-driven", "Add more detail", "Make it shorter", "Focus on [genre]", "Shift hook to [trait]"
- **Content Opportunities**: "Add more detail", "Make it shorter", "Explore deeper", "Focus on [genre]", "Suggest more crossover ideas"

For presets containing "[genre]" or "[trait]", display a dropdown allowing the user to pick from the audience's actual genres or traits.

**Freeform refinement input:**

Below the presets, a text input field allows the user to type a custom refinement prompt. When submitted, it sends the current output content plus the user's prompt to the AI for refinement via streaming.

The freeform prompt is constrained by a system-level instruction that limits the AI to modifications relevant to the audience data context. If the user submits an off-topic prompt (e.g., "write me a poem about cats"), the AI should respond with a message indicating it can only refine the output based on the audience data.

**Refinement API flow:**

Refinements (both preset and freeform) call a variant of the POST /api/creative endpoint that includes the existing content and a refinement instruction. The AI receives: the current output, the audience data context, and the refinement instruction. It streams back the modified output. On completion, the updated content is saved via PATCH, replacing the previous version.

## Acceptance Criteria

- [ ] PATCH /api/creative/[id] updates the content JSONB and returns the updated record
- [ ] GET /api/creative/[id] returns the full creative output with ownership verification
- [ ] Each output card has a "Regenerate" button that produces a fresh generation after confirmation
- [ ] All text fields in output cards are inline-editable (click to edit, auto-save on blur/Enter)
- [ ] Inline edits are persisted via PATCH to the content JSONB
- [ ] Each workflow type displays its own set of preset refinement buttons
- [ ] Presets with "[genre]" or "[trait]" placeholders show a dropdown of actual audience values
- [ ] Clicking a preset streams a refined version of the output using the AI
- [ ] A freeform text input allows custom refinement prompts
- [ ] Freeform prompts are constrained to audience-relevant modifications by the system prompt
- [ ] Off-topic freeform prompts receive a rejection message from the AI
- [ ] Refined output replaces the previous version and is auto-saved
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `012-persona-workflow-streaming-foundation.md`

## User Stories Covered

- User story 48: Regenerate an entire creative output for fresh results
- User story 49: Click on any text field and edit it directly
- User story 50: Use preset refinement buttons specific to each workflow type
- User story 51: Type a freeform refinement prompt
- User story 52: Freeform prompts are constrained to audience-relevant modifications

## Out of Scope

- Creating new workflow types
- Comparing versions of the same output (no version history)
- Collaborative editing
