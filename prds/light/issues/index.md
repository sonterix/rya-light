---
feature: Light
prd: .claude/prds/light/prd.md
generated: 2026-04-01
total: 16
ready: 3
blocked: 11
done: 2
---

# Light — Issues

| Priority | #   | File                                              | Title                                              | Status  | Attempts | Blocked By                                                                                        |
| -------- | --- | ------------------------------------------------- | -------------------------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| 1        | 001 | `001-database-schema-migrations-rls.md`           | Database schema, migrations, and RLS               | Done    | 1        | None                                                                                              |
| 1        | 003 | `003-supabase-auth-clients-middleware.md`          | Supabase auth clients and middleware               | Done    | 1        | None                                                                                              |
| 2        | 002 | `002-seed-data-setup-script.md`                   | Seed data and setup script                         | Ready   | 0        | `001-database-schema-migrations-rls.md`                                                           |
| 2        | 004 | `004-sign-in-sign-up-page.md`                     | Sign in and sign up page                           | Ready   | 0        | `003-supabase-auth-clients-middleware.md`                                                         |
| 2        | 005 | `005-app-shell-sidebar-providers.md`              | App shell with sidebar and providers               | Ready   | 0        | `003-supabase-auth-clients-middleware.md`                                                         |
| 3        | 006 | `006-respondent-explorer-page.md`                 | Respondent explorer page                           | Blocked | 0        | `001-database-schema-migrations-rls.md`, `005-app-shell-sidebar-providers.md`                     |
| 3        | 007 | `007-audience-builder-create-list.md`             | Audience builder - create and list                 | Blocked | 0        | `001-database-schema-migrations-rls.md`, `005-app-shell-sidebar-providers.md`                     |
| 4        | 008 | `008-audience-manual-overrides.md`                | Audience manual overrides                          | Blocked | 0        | `007-audience-builder-create-list.md`                                                             |
| 4        | 009 | `009-audience-update-delete.md`                   | Audience update and delete                         | Blocked | 0        | `007-audience-builder-create-list.md`                                                             |
| 4        | 010 | `010-genre-insights-computation-visualization.md` | Genre insights computation and visualization       | Blocked | 0        | `007-audience-builder-create-list.md`                                                             |
| 4        | 011 | `011-creative-page-layout-output-management.md`   | Creative page layout and output management         | Blocked | 0        | `005-app-shell-sidebar-providers.md`, `007-audience-builder-create-list.md`                       |
| 5        | 012 | `012-persona-workflow-streaming-foundation.md`    | Audience Persona workflow with streaming foundation | Blocked | 0        | `011-creative-page-layout-output-management.md`                                                   |
| 6        | 013 | `013-campaign-concepts-workflow.md`               | Campaign Concepts workflow                         | Blocked | 0        | `012-persona-workflow-streaming-foundation.md`                                                    |
| 6        | 014 | `014-messaging-angles-workflow.md`                | Messaging Angles workflow                          | Blocked | 0        | `012-persona-workflow-streaming-foundation.md`                                                    |
| 6        | 015 | `015-content-opportunity-finder-workflow.md`      | Content Opportunity Finder workflow                | Blocked | 0        | `012-persona-workflow-streaming-foundation.md`                                                    |
| 6        | 016 | `016-creative-output-editing.md`                  | Creative output editing                            | Blocked | 0        | `012-persona-workflow-streaming-foundation.md`                                                    |
