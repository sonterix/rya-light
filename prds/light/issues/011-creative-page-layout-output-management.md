---
id: 011
title: Creative page layout and output management
status: Ready
priority: 4
attempts: 0
blocked_by: ["005-app-shell-sidebar-providers.md", "007-audience-builder-create-list.md"]
user_stories: [31, 32, 33, 35, 36, 39]
created: 2026-04-01
---

# Creative page layout and output management

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The app shell with sidebar exists (from issue 005) and audiences can be created and selected (from issue 007). The `/creative` page needs to be built as the workspace where users generate and manage AI creative outputs.

## What to Build

**API routes:**

1. `GET /api/creative` — Returns all creative outputs for the authenticated user. Accepts optional query parameters: `audience_id` (filter by audience) and `type` (filter by workflow type: persona, campaign, messaging, opportunity). Results ordered by created_at DESC. Each record includes id, audience_id, type, content (JSONB), created_at, and updated_at.

2. `DELETE /api/creative/[id]` — Deletes a single creative output. Verifies ownership. Returns success confirmation.

Both routes require authentication, verify ownership, validate input with Zod, and return consistent response shapes.

**API route for genres (if not already created):**

`GET /api/genres` — Returns all genres. Used by creative workflows to include genre data in AI prompts. No auth required beyond being authenticated.

**Creative page layout:**

The `/creative` page reads the selected audience ID from the Zustand store. The page has these sections:

1. **Audience context header** — Shows the name of the currently selected audience at the top of the page. If no audience is selected, the entire page shows a prompt directing the user to go to the dashboard and select or create an audience (with a link to `/dashboard`).

2. **Workflow type selector** — Four clickable cards or tabs representing the workflow types: Audience Persona Snapshot, Campaign Concepts, Messaging Angles, and Content Opportunity Finder. Each shows a title, brief description, and an icon. Selecting a workflow type filters the output list and shows the generation UI for that type.

3. **Output history** — Below the workflow selector, display all previously generated outputs for the selected audience, grouped by the currently selected workflow type. Each output is shown as a card with a preview of its content, timestamp, and a delete button. Outputs are ordered most recent first.

4. **Generate button** — A prominent button to generate new output for the selected workflow type and audience. In this issue, clicking it does nothing (actual generation is wired in issue 012). The button should be visually ready but functionally inert.

5. **OpenAI key missing state** — If the OpenAI API key is not configured in the environment, the creative page shows a notice explaining that AI features require an OpenAI key and how to add it. The generate button is disabled.

**Delete output:**

Each output card has a delete action. Clicking it shows a confirmation, then calls DELETE /api/creative/[id]. On success, the output is removed from the list and a success toast is shown.

## Acceptance Criteria

- [ ] GET /api/creative returns creative outputs filterable by audience_id and type
- [ ] DELETE /api/creative/[id] removes the output and verifies ownership
- [ ] GET /api/genres returns all genres
- [ ] The creative page displays the selected audience name in a header
- [ ] If no audience is selected, a prompt directs the user to the dashboard
- [ ] Four workflow types are displayed as selectable cards/tabs
- [ ] Selecting a workflow type filters the output list to that type
- [ ] Previously generated outputs for the selected audience and type are displayed as cards with content preview, timestamp, and delete button
- [ ] Deleting an output shows confirmation, removes it from the list, and shows a success toast
- [ ] A generate button exists but is functionally inert in this issue
- [ ] If the OpenAI key is missing, a notice is displayed and the generate button is disabled
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `005-app-shell-sidebar-providers.md`
- `007-audience-builder-create-list.md`

## User Stories Covered

- User story 31: Navigate to Creative and see the selected audience context carried over
- User story 32: See a prompt to go to dashboard if no audience is selected
- User story 33: Choose between four creative workflow types
- User story 35: See all previously generated outputs grouped by workflow type
- User story 36: Delete a creative output
- User story 39: See a notice if OpenAI key is not configured

## Out of Scope

- Actual AI generation (covered by issues 012-015)
- Creative output editing (covered by issue 016)
- Genre insights on this page
