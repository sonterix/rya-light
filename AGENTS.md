# Rules

> These rules are absolute and override all defaults. Do not skip, reorder, adapt, or "optimize" any rule. If you catch yourself reasoning about why a rule doesn't apply here, stop - it does. Follow every rule exactly as written, every time, without exception.

## Project Overview

Lightweight audience insights platform built with Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, React Query, Zustand, Drizzle ORM, and Supabase (local). OpenAI via Vercel AI SDK for creative workflows.

## Project Structure

- Modular architecture with shared components, types, and utils
- Single source of truth for all types, state, and logic
- Clear separation between feature modules and shared code

```
src/
  app/              # Next.js App Router (pages, layouts, API routes)
  components/
    ui/             # shadcn/ui primitives (do not modify directly)
    shared/         # Reusable presentational components
    [feature]/      # Feature-specific components
  db/
    schema/         # Drizzle table definitions (single source of truth for DB types)
    index.ts        # DB client
  lib/              # Shared utilities, helpers, constants
  types/            # Shared TypeScript types and interfaces
  stores/           # Zustand stores
  hooks/            # Shared custom hooks
```

## Code Comments

- Do not add unnecessary comments. Code should be self-documenting through descriptive names and clear structure.
- Only comment non-obvious or tricky logic that is not clear when reading the code with minimum context.
- Never add comments that restate what the code already says.
- Never add JSDoc comments, file-level descriptions, or section dividers unless explicitly asked.

## Core Principles

- **Single Source of Truth (SSOT)**: Every piece of data, type, or logic has exactly one authoritative location. Never duplicate state, types, or constants.
- **DRY (Don't Repeat Yourself)**: Extract shared logic only when the duplication is real (3+ occurrences with identical intent), not speculative. Three similar lines are better than a premature abstraction.
- **Single Responsibility Principle (SRP)**: Every file, function, component, and module does one thing. If you can't describe what it does in one sentence, split it.
- **YAGNI (You Aren't Gonna Need It)**: Do not build for hypothetical future requirements. No feature flags, abstractions, or config options that aren't needed right now.
- **Composition Over Inheritance**: Build complex behavior by composing small, focused units. Prefer hooks, utility functions, and component composition over class hierarchies or deep nesting.
- **Fail Fast**: Validate inputs at system boundaries (API routes, form submissions, env vars) and throw immediately on invalid state. Do not silently swallow errors or return defaults for broken data.
- **Least Surprise**: Code should behave as its name and signature suggest. No hidden side effects, no magic. If a function is called `getUser`, it should not mutate anything.
- **Explicit Over Implicit**: Prefer explicit returns, explicit types, explicit dependencies. Avoid relying on coercion, default behaviors, or ambient context.
- **Descriptive Names**: No single-letter variables (exception: `.sort((a, b) => ...)`). Variable and function names must clearly convey purpose.

## TypeScript Rules

- NEVER use `any`. No exceptions.
- NEVER use `as` type casting. Use type guards, discriminated unions, or proper generics instead.
- Every function parameter, return type, and variable must be explicitly typed or correctly inferred.
- Types have one source of truth. Drizzle schema is the source of truth for DB-related types. Use `typeof` and Drizzle's `InferSelectModel` / `InferInsertModel` instead of duplicating.
- Shared types go in `src/types/`. Feature-specific types that are used only within a single component file can stay in that file. Everything else is shared.

## React / Next.js Rules

### Component Structure

- One component per file. No exceptions.
- NEVER define a component inside another component.
- Presentational components (UI rendering) and data components (fetching, mutations) must be clearly separated. Use container/presenter pattern or server components for data fetching.
- Every component that accepts props must define an `interface Props` at the top of the file.
- Only helpers and types that are specific to a single component may live in that component's file. If reused anywhere, move to shared.

### Component Internal Order

Follow this exact order inside every component:

1. Hook calls (`useQuery`, `useStore`, `useRouter`, custom hooks)
2. Variables, `useMemo` derivations
3. Refs, state (`useRef`, `useState`)
4. Functions, `useCallback` definitions
5. Early returns (loading, error, empty states)
6. Main JSX return

### Hooks and Effects

- `useEffect` only when absolutely necessary (syncing with external systems, subscriptions, non-React APIs). If React Query, server components, or event handlers can solve it, use those instead.
- No `useRef` workarounds to avoid re-renders or stale closures. Fix the root cause.
- Single source of truth for all state. No derived state stored in `useState` when it can be computed.

### State Management

- **React Query**: All client-side API calls and their related states (loading, error, cache). Query hooks live in `src/hooks/` or co-located with features.
- **Zustand**: Global app state that needs to be accessed across the app (user data, UI preferences). Not for server data - that's React Query's job.
- **Local state (`useState`)**: UI-only state scoped to a single component (open/close toggles, form input values). If it doesn't leave the component, keep it local.
- Prefer server components over client components. Only add `'use client'` when you need interactivity, browser APIs, or hooks.

### Loading States

- All loading states must use skeleton components. No spinners, no "Loading..." text.
- Follow the design system skeletons from shadcn/ui.

### Design System

- Follow shadcn/ui design system at all times. No custom one-off styles that deviate from the system.
- Use shadcn components and Tailwind utility classes. No inline styles.
- Spacing, colors, typography, and border radius must come from the design tokens.

## Database Rules

- All tables must have proper indexes. Use B-tree indexes for equality/range lookups, GIN for full-text or JSONB.
- Add composite indexes for queries that filter on multiple columns.
- Foreign keys must have corresponding indexes.
- Use Drizzle schema as the single source of truth. Migrations generated via `drizzle-kit generate`.

## API / Backend Rules

- API routes follow RESTful naming: `/api/[resource]` (plural nouns, no verbs).
- Use HTTP methods correctly: GET (read), POST (create), PATCH (update), DELETE (remove).
- Every API route must validate input with Zod schemas.
- Every mutating API route must check authentication and authorization before processing.
- Return consistent response shapes: `{ data }` on success, `{ error }` on failure with proper HTTP status codes.

## Testing Rules

- Stack: Vitest + React Testing Library + jest-dom matchers.
- Test files live next to the code they test: `ComponentName.test.tsx` or `utils.test.ts`.
- No redundant tests. Do not test framework behavior or implementation details.
- Every feature must have tests for the happy path and meaningful edge cases.
- Test behavior, not implementation. Tests should not break when refactoring internals.
- Use `screen` queries from Testing Library. Prefer `getByRole`, `getByLabelText` over `getByTestId`.
- Name tests descriptively: `it('returns top genres sorted by interest level')`.
- Vitest globals are enabled (`describe`, `it`, `expect` available without imports).

## Git Rules

- No branch prefixes (`feature/`, `fix/`). Max 5 words, hyphen-separated.
- Each logical group of changes gets its own commit.
- Max 6 words per commit message, imperative mood, capitalize first letter.
- No Co-Authored-By lines. No multi-line descriptions.

## Commands Reference

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier format all
npm run format:check   # Prettier check
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Run migrations
npm run db:push        # Push schema directly (prototyping)
npm run db:studio      # Open Drizzle Studio
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
supabase start         # Start local Supabase
supabase stop          # Stop local Supabase
supabase status        # Show local Supabase URLs and keys
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase publishable/anon key
SUPABASE_SERVICE_ROLE_KEY     # Supabase service role key (server-side only)
DATABASE_URL                  # PostgreSQL connection string
OPENAI_API_KEY                # OpenAI API key for creative workflows
```
