---
id: 009
title: Audience update and delete
status: Blocked
priority: 4
attempts: 0
blocked_by: ["007-audience-builder-create-list.md"]
user_stories: [21, 25]
created: 2026-04-01
---

# Audience update and delete

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The audience builder with creation and listing exists (from issue 007). Users can create audiences and select them. Now they need the ability to edit existing audiences and delete ones they no longer need.

## What to Build

**API routes:**

1. `PATCH /api/audiences/[id]` — Updates an existing audience. Accepts partial updates to: name, filters, manual_includes, manual_excludes. Verifies ownership (user_id matches authenticated user). Updates the `updated_at` timestamp. Returns the updated audience.

2. `DELETE /api/audiences/[id]` — Deletes an audience. Verifies ownership. Cascade-deletes all associated genre summaries and creative outputs. Returns a success confirmation.

Both routes require authentication, verify ownership, validate input with Zod, and return consistent response shapes.

**Auto-save on edit:**

When the user modifies an existing audience (changes its name, adjusts filters, or modifies manual overrides), the changes are automatically saved via the PATCH API. There is no manual "Save" button. Use debouncing to avoid excessive API calls while the user is actively adjusting filters.

**Zero-match warning:**

When the current filter configuration (including manual overrides) results in zero matching respondents, display a visible warning message in the audience builder indicating that no respondents match the current criteria. The warning should guide the user to adjust their filters.

**Delete audience:**

Add a delete action to each audience card on the dashboard (e.g., a delete button or a context menu option). Before deleting, show a confirmation prompt since deletion also removes all associated genre summaries and creative outputs. On successful deletion:
- Remove the audience card from the dashboard
- If the deleted audience was the currently selected one, clear the selection in the Zustand store
- Show a success toast notification

## Acceptance Criteria

- [ ] PATCH /api/audiences/[id] updates audience fields and returns the updated record
- [ ] PATCH verifies ownership and rejects requests for audiences belonging to other users
- [ ] DELETE /api/audiences/[id] removes the audience and cascade-deletes associated genre summaries and creative outputs
- [ ] DELETE verifies ownership and rejects requests for other users' audiences
- [ ] Editing an audience's name, filters, or overrides triggers an auto-save via PATCH (debounced)
- [ ] A warning message appears when filters match zero respondents
- [ ] Each audience card has a delete action
- [ ] Deleting an audience shows a confirmation prompt before proceeding
- [ ] Successful deletion removes the card, clears selection if needed, and shows a success toast
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `007-audience-builder-create-list.md`

## User Stories Covered

- User story 21: See a warning when filters match zero respondents
- User story 25: Delete an audience I no longer need

## Out of Scope

- Audience creation (covered by issue 007)
- Manual override UI (covered by issue 008)
- Genre insight recalculation on edit (covered by issue 010)
