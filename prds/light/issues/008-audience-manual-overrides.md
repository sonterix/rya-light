---
id: 008
title: Audience manual overrides
status: Blocked
priority: 4
attempts: 0
blocked_by: ["007-audience-builder-create-list.md"]
user_stories: [16, 17, 18, 19, 20]
created: 2026-04-01
---

# Audience manual overrides

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The audience builder with filter-based audience creation exists (from issue 007). Users can create audiences using demographic filters. Now they need the ability to manually override the filter results by force-including or force-excluding individual respondents.

## What to Build

**Manual include behavior:**

In the audience builder's matching respondent list, add the ability to include a respondent who does not match the current filters. This could be triggered by browsing all respondents and selecting ones to force-include. When a respondent is manually included:

- They appear in the matching respondent list even though they don't match the filters.
- They display a "Manually added" badge next to their name/ID to distinguish them from filter-matched respondents.
- Their respondent ID is added to the audience's `manual_includes` array.
- The audience is auto-saved with the updated manual_includes.

**Manual exclude behavior:**

In the matching respondent list, add the ability to exclude a respondent who matches the filters. When a respondent is manually excluded:

- They are removed from the visible matching respondent list.
- A clickable count appears (e.g., "3 excluded") showing how many respondents have been manually excluded.
- Their respondent ID is added to the audience's `manual_excludes` array.
- The audience is auto-saved with the updated manual_excludes.

**Revealing excluded respondents:**

Clicking the excluded count (e.g., "3 excluded") reveals the excluded respondents in a panel, drawer, or expandable section. Each excluded respondent shows their basic info and a button to re-include them (remove from manual_excludes). Re-including an excluded respondent removes them from manual_excludes and they reappear in the main list (if they still match filters) or disappear (if they don't match filters and aren't in manual_includes).

**Persistence:**

All manual overrides are persisted via the existing audience PATCH API (or by updating the audience through the existing creation/update flow). The manual_includes and manual_excludes arrays are stored in the audience record.

## Acceptance Criteria

- [ ] Users can manually include a respondent who does not match the current filters
- [ ] Manually included respondents appear in the matching list with a "Manually added" badge
- [ ] Users can manually exclude a respondent who matches the current filters
- [ ] Excluded respondents are hidden from the main list
- [ ] A clickable count (e.g., "3 excluded") shows the number of manually excluded respondents
- [ ] Clicking the excluded count reveals the excluded respondents with the option to re-include each one
- [ ] Re-including a previously excluded respondent removes them from the excluded list and returns them to the main list if they match filters
- [ ] Manual overrides are persisted to the audience's manual_includes and manual_excludes arrays
- [ ] The audience auto-saves when manual overrides change
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `007-audience-builder-create-list.md`

## User Stories Covered

- User story 16: Manually include a respondent not matching filters
- User story 17: See a "Manually added" badge on manually included respondents
- User story 18: Manually exclude a respondent matching filters
- User story 19: See excluded respondents hidden with a clickable count
- User story 20: Click excluded count to reveal and re-include respondents

## Out of Scope

- Audience deletion (covered by issue 009)
- Genre insights recalculation on override changes (covered by issue 010)
- Filter creation or editing (covered by issue 007)
