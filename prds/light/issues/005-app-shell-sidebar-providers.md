---
id: 005
title: App shell with sidebar and providers
status: Ready
priority: 2
attempts: 0
blocked_by: ["003-supabase-auth-clients-middleware.md"]
user_stories: [4, 5, 6, 53, 54, 55]
created: 2026-04-01
---

# App shell with sidebar and providers

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

Supabase auth is configured (from issue 003). The application needs a shared layout for all authenticated pages with navigation, state management providers, and notification infrastructure.

## What to Build

**Install required dependencies and components:**

- Install shadcn Sidebar component (provides togglable collapsed/expanded behavior)
- Install shadcn Skeleton component (for loading states across the app)
- Install Sonner toast library (for notifications)
- Install a charting library (for genre insights bar chart in a future issue)

**React Query provider:**

Create a React Query client and wrap the application in a QueryClientProvider. This must be a client component that wraps the layout children. Configure sensible defaults for stale time and retry behavior.

**Zustand audience store:**

Create a Zustand store that holds the currently selected audience ID. This store is used to carry the selected audience context between the Dashboard and Creative pages. It should provide actions to set and clear the selected audience.

**Authenticated layout:**

Create a layout that wraps all authenticated pages (respondents, dashboard, creative). This layout:

1. Renders the shadcn Sidebar on the left side with three navigation items: Respondents, Dashboard, and Creative (each with an appropriate icon from Lucide).
2. The sidebar is togglable between expanded (icons + labels) and minimized (icons only) using the shadcn Sidebar's built-in toggle mechanism.
3. The bottom of the sidebar displays the current user's email and a "Sign Out" button.
4. Clicking "Sign Out" calls the Supabase auth sign-out method and redirects to `/auth`.
5. The main content area fills the remaining horizontal space.

**Toast provider:**

Add the Sonner Toaster component to the root layout so toast notifications are available on every page. Toasts should appear in a consistent position (e.g., bottom-right).

**Skeleton infrastructure:**

Ensure the Skeleton component is available for use by all feature pages. No specific skeletons need to be built in this issue — just the component availability.

**Route structure:**

Set up the page files for the three authenticated routes (`/respondents`, `/dashboard`, `/creative`) with placeholder content. Each should render inside the authenticated layout.

## Acceptance Criteria

- [ ] shadcn Sidebar, Skeleton components are installed and available
- [ ] Sonner toast library is installed and the Toaster component is mounted in the root layout
- [ ] A charting library is installed as a dependency
- [ ] React Query provider wraps the application and a QueryClient is configured
- [ ] A Zustand store exists with selected audience ID state and set/clear actions
- [ ] The authenticated layout renders a togglable sidebar with Respondents, Dashboard, and Creative navigation items
- [ ] The sidebar can be toggled between expanded (icons + labels) and minimized (icons only)
- [ ] The sidebar bottom section shows the current user's email and a Sign Out button
- [ ] Clicking Sign Out signs the user out and redirects to `/auth`
- [ ] Toast notifications can be triggered from any page (success, error, info, warning variants work)
- [ ] Placeholder pages exist at `/respondents`, `/dashboard`, and `/creative`
- [ ] Loading states across the app use skeleton components (no spinners or "Loading..." text)
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `003-supabase-auth-clients-middleware.md`

## User Stories Covered

- User story 4: As a marketer, I want to sign out from the sidebar
- User story 5: As a marketer, I want a sidebar with links to Respondents, Dashboard, and Creative
- User story 6: As a marketer, I want to toggle the sidebar between expanded and minimized
- User story 53: As a marketer, I want to see a success toast when an action completes
- User story 54: As a marketer, I want to see an error toast when something fails
- User story 55: As a marketer, I want to see skeleton loading states instead of spinners

## Out of Scope

- Actual page content for respondents, dashboard, or creative (covered by subsequent issues)
- Auth page UI (covered by issue 004)
- Database schema (covered by issue 001)
