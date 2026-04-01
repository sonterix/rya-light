---
id: 007
title: Audience builder - create and list
status: Ready
priority: 3
attempts: 0
blocked_by: ["001-database-schema-migrations-rls.md", "005-app-shell-sidebar-providers.md"]
user_stories: [12, 13, 14, 15, 22, 23, 24]
created: 2026-04-01
---

# Audience builder - create and list

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The database schema exists (from issue 001) and the app shell with sidebar is in place (from issue 005). The `/dashboard` page needs the audience builder — the core feature where marketers create and select audiences.

## What to Build

**API routes:**

1. `GET /api/audiences` — Returns all audiences belonging to the authenticated user, ordered by most recently updated. Each audience includes its id, name, filter configuration, manual includes/excludes, and timestamps.

2. `POST /api/audiences` — Creates a new audience. Accepts: name (required), filters (JSONB object), manual_includes (integer array, defaults to empty), manual_excludes (integer array, defaults to empty). Sets user_id from the authenticated session. Returns the created audience. The audience is automatically saved on creation.

3. `GET /api/audiences/[id]` — Returns a single audience with its full configuration AND the list of respondents that match its current filter rules (applying manual includes and excludes). The matching logic works as follows:
   - Start with all respondents that match the filter rules
   - Add any respondents in manual_includes that don't already match
   - Remove any respondents in manual_excludes
   - Return the final list

All routes require authentication and verify ownership (user_id matches auth.uid()). Input validated with Zod. Consistent response shapes.

**Filter matching logic:**

The filters JSONB stores an object where each key is a respondent field name and the value defines the filter rule:
- For categorical fields (audience_category, gender, region, state, etc.): value is an array of accepted values. A respondent matches if their value is in the array.
- For numeric range fields (age, household_income_usd): value is an object with optional `min` and `max`. A respondent matches if their value is within the range (inclusive).
- Multiple filters combine with AND logic (respondent must match all filters).

**Dashboard UI:**

The `/dashboard` page has two sections:

1. **Audience cards** — Displays all saved audiences as cards in a grid. Each card shows the audience name and a count of matching respondents. Clicking a card selects that audience (sets it in the Zustand audience store) and highlights it as active. A "Create Audience" button opens the audience creation flow.

2. **Audience creation flow** — A form/dialog where the user:
   - Enters an audience name
   - Sets filters using the filter controls
   - Sees a live preview of matching respondents that updates as filters change
   - Saves the audience (which auto-saves via the POST API)

**Filter controls:**

Four filters are always visible:
- Audience Category: dropdown/select with the distinct values from the data
- Age: range input (min/max number inputs)
- Gender: multi-select with distinct values
- Region: multi-select with distinct values

Seven additional filters are behind an "Advanced Filters" toggle:
- State, Community Type, Household Income (range), Parent Status, Education, Employment Status, Home Ownership — each as appropriate input types (multi-select for categorical, range for numeric).

As the user adjusts any filter, the matching respondent list updates in real-time (debounced API call or client-side filtering of loaded data).

**Audience selection:**

When a user clicks an audience card, that audience's ID is stored in the Zustand store. This ID persists across navigation to other pages (Creative page will read it). The selected audience card should be visually highlighted.

## Acceptance Criteria

- [ ] GET /api/audiences returns all audiences for the authenticated user ordered by updated_at DESC
- [ ] POST /api/audiences creates a new audience with name, filters, and manual overrides
- [ ] GET /api/audiences/[id] returns the audience config plus the list of matching respondents after applying filters and manual overrides
- [ ] Filter matching logic correctly handles categorical (array of values) and numeric range (min/max) filters with AND combination
- [ ] The dashboard displays saved audiences as cards with name and respondent count
- [ ] Clicking an audience card selects it and stores the ID in the Zustand audience store
- [ ] The selected audience card is visually highlighted
- [ ] A "Create Audience" flow lets users name an audience, set filters, and see a live preview of matching respondents
- [ ] Four filter controls are always visible: Audience Category, Age, Gender, Region
- [ ] Seven additional filters are behind an "Advanced Filters" toggle
- [ ] The matching respondent preview updates in real-time as filters are adjusted
- [ ] New audiences are automatically saved on creation
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `001-database-schema-migrations-rls.md`
- `005-app-shell-sidebar-providers.md`

## User Stories Covered

- User story 12: Create a named audience with filters
- User story 13: Filter by audience category, age, gender, region (always visible)
- User story 14: Access advanced filters behind a toggle
- User story 15: See matching respondents update in real-time
- User story 22: Audiences auto-save on creation
- User story 23: See saved audiences as cards on dashboard
- User story 24: Select an audience to set it as active context

## Out of Scope

- Manual include/exclude UI (covered by issue 008)
- Audience editing and deletion (covered by issue 009)
- Genre insights (covered by issue 010)
