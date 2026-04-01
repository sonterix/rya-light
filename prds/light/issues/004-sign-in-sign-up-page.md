---
id: 004
title: Sign in and sign up page
status: Blocked
priority: 2
attempts: 0
blocked_by: ["003-supabase-auth-clients-middleware.md"]
user_stories: [1, 2]
created: 2026-04-01
---

# Sign in and sign up page

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

Supabase auth clients and middleware are in place (from issue 003). The middleware redirects unauthenticated users to `/auth`, but that page does not exist yet.

## What to Build

Create an authentication page at the `/auth` route that lets users sign in to an existing account or register a new one.

**Page layout:**

The page displays a centered card with two tabs at the top: "Sign In" and "Sign Up." The tabs toggle between the two forms on the same page. The default active tab is "Sign In."

**Sign In form:**

- Email field (required, validated as email format)
- Password field (required)
- Submit button labeled "Sign In"
- On success: redirect to `/dashboard`
- On error: display the error message inline below the form (e.g., "Invalid email or password")

**Sign Up form:**

- Email field (required, validated as email format)
- Password field (required, minimum 6 characters per Supabase config)
- Submit button labeled "Sign Up"
- On success: redirect to `/dashboard` (email confirmation is disabled in Supabase config, so the user is immediately authenticated)
- On error: display the error message inline below the form (e.g., "User already registered")

Both forms use the browser Supabase client to call the appropriate auth methods. Loading states should disable the submit button and show a loading indicator while the request is in progress.

The page should follow the application's design system (shadcn/ui components, design tokens from the theme). Install any required shadcn components (tabs, input, label, card) if not already present.

## Acceptance Criteria

- [ ] The `/auth` page renders with "Sign In" and "Sign Up" tabs
- [ ] "Sign In" is the default active tab
- [ ] Submitting valid credentials on the Sign In form authenticates the user and redirects to `/dashboard`
- [ ] Submitting invalid credentials on the Sign In form displays an inline error message
- [ ] Submitting the Sign Up form with a new email creates an account, authenticates the user, and redirects to `/dashboard`
- [ ] Submitting the Sign Up form with an already-registered email displays an inline error message
- [ ] Email fields validate email format before submission
- [ ] Password field on Sign Up enforces a minimum of 6 characters
- [ ] Submit buttons show a loading state during the auth request
- [ ] The page follows the application's design system (shadcn components, theme tokens)
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

- `003-supabase-auth-clients-middleware.md`

## User Stories Covered

- User story 1: As a marketer, I want to sign up with my email and password
- User story 2: As a marketer, I want to sign in with my existing credentials

## Out of Scope

- Forgot password flow
- OAuth / social login providers
- Sign out functionality (covered by issue 005)
