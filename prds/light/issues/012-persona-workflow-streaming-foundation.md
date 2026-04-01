---
id: 012
title: Audience Persona workflow with streaming foundation
status: Ready
priority: 5
attempts: 0
blocked_by: ["011-creative-page-layout-output-management.md"]
user_stories: [34, 37, 38, 40, 41]
created: 2026-04-01
---

# Audience Persona workflow with streaming foundation

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The creative page layout with workflow selection and output management exists (from issue 011). This issue builds the first creative workflow (Audience Persona Snapshot) and establishes the streaming infrastructure that all subsequent workflows will reuse.

## What to Build

**Streaming API route:**

`POST /api/creative` — Accepts `{ audience_id, type }` in the request body. For this issue, handle the `persona` type.

The route must:
1. Verify authentication and that the audience belongs to the current user.
2. Fetch the audience's respondent data (demographics) and genre insights (from the precomputed summaries) to build the AI context.
3. Use the Vercel AI SDK's `streamText()` function with `Output.object()` to generate a structured persona output. The model receives:
   - A system prompt explaining the task: synthesize audience demographics and genre interests into a readable persona profile.
   - The actual audience data (demographics summary, top genre interests) as context.
4. Stream the response back to the client using `.toTextStreamResponse()`.
5. Set `maxDuration` to 60 seconds on the route.

**Zod schema for persona output:**

Define a Zod schema that the AI must conform to:
- `name` (string) — a fictional persona name representing the audience
- `demographicSummary` (string) — summary of age range, gender split, location, income
- `topInterests` (array of objects with `genreName` and `interestLevel` fields) — top genre interests
- `lifestyleDescription` (string) — narrative description of the audience's lifestyle
- `howToReachThem` (string) — tactical advice on channels and approaches to reach this audience

Use `.nullable()` instead of `.optional()` for any fields that could be absent (required for OpenAI structured output compatibility).

**Auto-save on stream completion:**

When the stream finishes successfully, save the complete output to the creative_outputs table with type "persona", the audience_id, and the user_id. This save happens server-side after the stream completes. The client is notified of the saved record's ID so the output appears in the history.

**Client-side streaming consumer:**

Build a reusable client-side hook or component pattern that:
1. Calls the POST API and reads the streaming response.
2. Progressively renders the persona as data arrives (fields appear one by one as the AI generates them).
3. Handles loading state (show a generating indicator while streaming).
4. On stream completion, adds the output to the local React Query cache and shows a success toast.
5. On stream error, displays an error message with a "Try again" button. Partial output is NOT saved.

This streaming consumer pattern must be designed for reuse by the campaign, messaging, and opportunity workflows in subsequent issues.

**Persona card UI:**

Render the generated persona as a visually structured card layout:
- Persona name as the card title
- Demographic summary as a subtitle or stats section with icons
- Top interests displayed as colored badges or pills
- Lifestyle description as a paragraph
- "How to reach them" as a distinct section with a different visual treatment

The design should follow the application's design system and feel polished enough to share with stakeholders.

## Acceptance Criteria

- [ ] POST /api/creative with type "persona" streams a structured persona object back to the client
- [ ] The AI receives actual audience demographics and genre interests as context (not generic prompting)
- [ ] The streamed output conforms to the defined Zod schema
- [ ] The persona is progressively rendered on the client as tokens arrive
- [ ] On successful stream completion, the output is automatically saved to the creative_outputs table
- [ ] The saved output appears in the output history list without a page refresh
- [ ] On stream failure, an error message with "Try again" is shown and no partial output is saved
- [ ] The persona renders as a visually structured card with name, demographics, interests as badges, lifestyle description, and "how to reach them" section
- [ ] The streaming consumer pattern is reusable (extractable for use by other workflow types)
- [ ] maxDuration is set to 60 seconds on the API route
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `011-creative-page-layout-output-management.md`

## User Stories Covered

- User story 34: All generated creative outputs are automatically saved
- User story 37: AI-generated content streams in progressively in real time
- User story 38: See an error message with "Try again" if generation fails
- User story 40: Generate a persona with name, demographics, interests, lifestyle, and reach advice
- User story 41: Persona rendered as a visual card layout with badges and structured sections

## Out of Scope

- Campaign concepts, messaging angles, or opportunity workflows (covered by issues 013-015)
- Editing or refining the generated persona (covered by issue 016)
- Regenerating the persona (covered by issue 016)
