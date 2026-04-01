---
id: 003
title: Supabase auth clients and middleware
status: Done
priority: 1
attempts: 1
blocked_by: []
user_stories: [3]
created: 2026-04-01
---

# Supabase auth clients and middleware

## Parent PRD

Light — `.claude/prds/light/prd.md`

## Context

The application uses Supabase for authentication but has no auth client setup or route protection. The `@supabase/supabase-js` package is installed but `@supabase/ssr` (required for server-side auth in Next.js App Router) is not.

## What to Build

**Install the missing dependency:**

Add `@supabase/ssr` to the project. This package is required for managing Supabase auth sessions via cookies in Next.js server components and middleware.

**Create two Supabase client utilities:**

1. A browser client — for use in client components (`'use client'`). Creates a Supabase client using the public URL and anon key from environment variables.

2. A server client — for use in server components, server actions, and API route handlers. Creates a Supabase client that reads and writes auth session cookies, enabling the server to know which user is making the request.

**Create Next.js middleware:**

A middleware that runs on every request and:

1. Refreshes the user's auth session (prevents token expiry during navigation).
2. Checks if the user is authenticated.
3. If the user is NOT authenticated and the requested path is not the auth page, redirects them to `/auth`.
4. If the user IS authenticated and the requested path is `/auth`, redirects them to `/dashboard`.

The middleware must not block requests to static assets, API routes that handle their own auth, or Next.js internal paths (`_next/`, favicon, etc.).

## Acceptance Criteria

- [ ] `@supabase/ssr` is installed as a project dependency
- [ ] A browser Supabase client utility exists and can be imported by client components
- [ ] A server Supabase client utility exists and can be imported by server components and API routes
- [ ] The server client correctly reads and writes auth session cookies
- [ ] Middleware runs on every page navigation and refreshes the auth session
- [ ] Unauthenticated users visiting any protected page are redirected to `/auth`
- [ ] Authenticated users visiting `/auth` are redirected to `/dashboard`
- [ ] Middleware does not interfere with static assets, Next.js internals, or favicon requests
- [ ] All new code passes typecheck, lint, and existing tests
- [ ] New tests are written and pass for all behavior introduced in this issue

## Blocked By

None — can start immediately.

## User Stories Covered

- User story 3: As a marketer, I want to be redirected to the sign-in page when I visit the app without being authenticated

## Out of Scope

- Sign in / sign up UI (covered by issue 004)
- Protected layout with sidebar (covered by issue 005)
- RLS policies (covered by issue 001)
