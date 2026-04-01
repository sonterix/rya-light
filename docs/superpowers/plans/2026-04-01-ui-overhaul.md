# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all reported UI issues: design system contrast, sidebar, dashboard layout, genre chart, filters, respondent table, creative page loading/duplicates, audience auto-select, and audience card density.

**Architecture:** Design system token fix first (Task 1) since it cascades to all components. Then sidebar (Task 2), audience auto-select (Task 3), dashboard/chart (Task 4-5), respondent table (Task 6), filters (Task 7), creative page (Task 8-9), audience card (Task 10).

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui, Recharts, Zustand, React Query

---

### Task 1: Fix design system tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

The root cause of most visual issues: transparent borders, suppressed shadows, low-contrast surfaces.

- [ ] **Step 1: Update border token for visible borders**

In `src/app/globals.css`, change the border color from 15% opacity to solid:

```css
/* OLD */
--border: #adb3b226;

/* NEW */
--border: #d4d8d7;
```

- [ ] **Step 2: Remove global shadow suppression**

Delete these lines from `@layer base`:

```css
*:not([data-allow-shadow]) {
  --tw-shadow: 0 0 #0000 !important;
  --tw-shadow-colored: 0 0 #0000 !important;
}
```

- [ ] **Step 3: Increase muted-foreground contrast**

```css
/* OLD */
--muted-foreground: #6b7574;

/* NEW */
--muted-foreground: #546362;
```

- [ ] **Step 4: Make input backgrounds distinct**

```css
/* OLD */
--input: #e4e9e8;

/* NEW */
--input: #dce2e1;
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Fix design tokens for contrast"
```

---

### Task 2: Fix sidebar - nav order, brand name

**Files:**
- Modify: `src/components/shared/app-sidebar.tsx`

- [ ] **Step 1: Reorder nav items and add brand**

Replace the NAV_ITEMS array so Dashboard is first:

```typescript
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Respondents', href: '/respondents', icon: Users },
  { label: 'Creative', href: '/creative', icon: Paintbrush },
] as const;
```

Add a brand header to the sidebar. Add `SidebarHeader` to the imports from `@/components/ui/sidebar`. Then add before `<SidebarContent>`:

```tsx
<SidebarHeader className="border-b border-sidebar-border px-4 py-3">
  <Link href="/dashboard" className="flex items-center gap-2">
    <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
      R
    </div>
    <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
      Light
    </span>
  </Link>
</SidebarHeader>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/app-sidebar.tsx
git commit -m "Fix sidebar nav order and add brand"
```

---

### Task 3: Move audience auto-select to app level

**Files:**
- Create: `src/hooks/use-audience-auto-select.ts`
- Modify: `src/app/(authenticated)/layout.tsx` (add a client wrapper)
- Create: `src/components/shared/audience-auto-select-provider.tsx`
- Modify: `src/components/audience/audience-grid.tsx` (remove auto-select logic)

The auto-select currently only runs in `AudienceGrid` on `/dashboard`. It needs to run on any authenticated page so `/creative` works when loaded directly.

- [ ] **Step 1: Create the auto-select hook**

Create `src/hooks/use-audience-auto-select.ts`:

```typescript
'use client';

import { useEffect } from 'react';

import { useAudiences } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

export function useAudienceAutoSelect(): void {
  const { data: audiences } = useAudiences();
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);

  const selectionIsStale =
    audiences &&
    audiences.length > 0 &&
    (!selectedAudienceId || !audiences.some((a) => a.id === selectedAudienceId));

  useEffect(() => {
    if (selectionIsStale && audiences && audiences.length > 0) {
      setSelectedAudienceId(audiences[0].id);
    }
  }, [selectionIsStale, audiences, setSelectedAudienceId]);
}
```

- [ ] **Step 2: Create the provider component**

Create `src/components/shared/audience-auto-select-provider.tsx`:

```tsx
'use client';

import type { ReactNode } from 'react';

import { useAudienceAutoSelect } from '@/hooks/use-audience-auto-select';

interface Props {
  children: ReactNode;
}

export function AudienceAutoSelectProvider({ children }: Props) {
  useAudienceAutoSelect();
  return <>{children}</>;
}
```

- [ ] **Step 3: Add provider to authenticated layout**

In `src/app/(authenticated)/layout.tsx`, import and wrap children:

```tsx
import { AudienceAutoSelectProvider } from '@/components/shared/audience-auto-select-provider';
```

Change the main content area from:
```tsx
<div className="flex flex-1 flex-col p-6">{children}</div>
```
to:
```tsx
<div className="flex flex-1 flex-col p-6">
  <AudienceAutoSelectProvider>{children}</AudienceAutoSelectProvider>
</div>
```

- [ ] **Step 4: Remove auto-select from AudienceGrid**

In `src/components/audience/audience-grid.tsx`, remove the `useEffect` import, the `selectionIsStale` variable, and the `useEffect` block (lines 3, 22-31). The component should no longer auto-select.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-audience-auto-select.ts src/components/shared/audience-auto-select-provider.tsx src/app/\(authenticated\)/layout.tsx src/components/audience/audience-grid.tsx
git commit -m "Move audience auto-select to app level"
```

---

### Task 4: Redesign dashboard layout for wide screens

**Files:**
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

The dashboard needs a proper wide-screen layout. Audience cards on the left, genre insights on the right in a 2-column layout. The selected audience context should be clearly communicated.

- [ ] **Step 1: Redesign dashboard page layout**

Rewrite `src/app/(authenticated)/dashboard/page.tsx`:

```tsx
'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { AudienceCreateSheet } from '@/components/audience/audience-create-sheet';
import { AudienceEditSheet } from '@/components/audience/audience-edit-sheet';
import { AudienceGrid } from '@/components/audience/audience-grid';
import { GenreInsightsChart } from '@/components/audience/genre-insights-chart';
import { Button } from '@/components/ui/button';
import type { Audience } from '@/db/schema';
import { useAudiences } from '@/hooks/use-audiences';
import { useAudienceStore } from '@/stores/audience-store';

export default function DashboardPage() {
  const selectedAudienceId = useAudienceStore((state) => state.selectedAudienceId);
  const setSelectedAudienceId = useAudienceStore((state) => state.setSelectedAudienceId);
  const { data: audiences } = useAudiences();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState<string | null>(null);

  const selectedAudience = audiences?.find((a) => a.id === selectedAudienceId);

  function handleAudienceCreated(audience: Audience) {
    setSelectedAudienceId(audience.id);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          {selectedAudience && (
            <p className="mt-1 text-sm text-muted-foreground">
              Viewing insights for <span className="font-medium text-foreground">{selectedAudience.name}</span>
            </p>
          )}
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          Create Audience
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Audiences</h2>
          <AudienceGrid onEdit={setEditingAudienceId} />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Genre Insights</h2>
          <GenreInsightsChart audienceId={selectedAudienceId} />
        </div>
      </div>

      <AudienceCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleAudienceCreated}
      />

      <AudienceEditSheet
        audienceId={editingAudienceId}
        onClose={() => setEditingAudienceId(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(authenticated\)/dashboard/page.tsx
git commit -m "Redesign dashboard with two-column layout"
```

---

### Task 5: Redesign genre insights chart

**Files:**
- Modify: `src/components/audience/genre-insights-chart.tsx`
- Modify: `src/app/api/audiences/[id]/insights/route.ts` (verify sort order)

The chart needs: proper sort order (best interest first = lowest avg score), cleaner presentation, readable data table below the chart.

- [ ] **Step 1: Check API sort order**

Read `src/app/api/audiences/[id]/insights/route.ts` and verify it sorts by `avgInterest ASC` (lowest = most interested). If it sorts DESC, fix to ASC. The interest scale is 1=highest interest, 5=unfamiliar, so ascending sort puts best genres first.

- [ ] **Step 2: Rewrite genre insights chart**

Replace `src/components/audience/genre-insights-chart.tsx` with a cleaner design:

- Sort chart entries by `pct` descending (highest % highly interested first) since that's the most business-relevant metric
- Replace the unreadable legend with a proper data table showing: genre name, % highly interested, avg interest score
- Use the chart for visual impact, table for detail
- Remove the "Show more" button - show top 10 in chart, full list in table
- Add empty state that communicates the audience context

The chart should show percentage of highly interested (the actionable metric) with avg interest as supporting data in the table.

- [ ] **Step 3: Commit**

```bash
git add src/components/audience/genre-insights-chart.tsx
git commit -m "Redesign genre insights chart and table"
```

---

### Task 6: Fix respondent table visibility

**Files:**
- Modify: `src/components/respondents/respondent-table-row.tsx`
- Modify: `src/components/respondents/respondent-detail-panel.tsx`

With the border token fix from Task 1, borders should already be visible. Additional fixes needed:

- [ ] **Step 1: Add stronger visual separation for expanded detail**

In `respondent-detail-panel.tsx`, change the wrapper background from `bg-muted/30` to `bg-muted` for more contrast against table rows. Add a bottom border.

In `respondent-table-row.tsx`, add `bg-muted/50` to the expanded row's `tr` to indicate it's the active row.

- [ ] **Step 2: Commit**

```bash
git add src/components/respondents/respondent-table-row.tsx src/components/respondents/respondent-detail-panel.tsx
git commit -m "Improve respondent table row contrast"
```

---

### Task 7: Fix filter controls readability

**Files:**
- Modify: `src/components/audience/filter-controls.tsx`

The multi-select buttons blend together. Need visual grouping and better contrast.

- [ ] **Step 1: Add section borders and improve spacing**

For each filter section (Audience Category, Age, Gender, Region), wrap in a container with `border border-border rounded-lg p-3` for clear grouping. Increase gap between sections from `gap-4` to `gap-5`.

For multi-select buttons: ensure selected state uses `bg-primary text-primary-foreground` (not just a border change). Unselected state should use `bg-surface-container-low` for visibility against the white background.

- [ ] **Step 2: Commit**

```bash
git add src/components/audience/filter-controls.tsx
git commit -m "Improve filter controls readability"
```

---

### Task 8: Fix creative page loading states and duplicate cards

**Files:**
- Modify: `src/app/(authenticated)/creative/page.tsx`
- Modify: `src/components/creative/creative-output-list.tsx`

Two issues:
1. No loading indicator during AI generation on existing cards (refinement/regeneration)
2. When generating new output, the streaming preview AND the output history both render, creating duplicates

- [ ] **Step 1: Remove inline streaming preview cards**

In `src/app/(authenticated)/creative/page.tsx`, remove the conditional blocks that render `PersonaCard`, `CampaignConceptsCard`, `MessagingAnglesCard`, `OpportunityCard` for partial/generating state (lines 96-122). The streaming preview creates duplicates with the output history. Instead, show a simple generating indicator above the output history:

```tsx
{isGenerating && (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
    <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    Generating {selectedType === 'persona' ? 'persona' : selectedType === 'campaign' ? 'campaign concepts' : selectedType === 'messaging' ? 'messaging angles' : 'content opportunities'}...
  </div>
)}
```

- [ ] **Step 2: Change output history from grid to vertical stack**

In `src/components/creative/creative-output-list.tsx`, change the grid layout to a single-column stack to avoid uneven heights:

```tsx
<div className="flex flex-col gap-4">
```

Remove the `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` classes from both the loading skeleton and the output list.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(authenticated\)/creative/page.tsx src/components/creative/creative-output-list.tsx
git commit -m "Fix creative page loading and layout"
```

---

### Task 9: Add loading state to creative output cards during refinement/regeneration

**Files:**
- Modify: `src/components/creative/creative-output-edit-card.tsx`

When a card is being regenerated or refined, overlay a loading indicator so the user knows it's in progress.

- [ ] **Step 1: Add loading overlay**

In `CreativeOutputEditCard`, after the existing `isRegenerating` computation, add a `isRefining` state that comes from the `RefinementPanel`'s `useRefineCreative` hook. When either `isRegenerating` or the refinement is active, show an overlay on the card:

```tsx
{(isRegenerating) && (
  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      {isRegenerating ? 'Regenerating...' : 'Refining...'}
    </div>
  </div>
)}
```

Make the Card `relative` to position the overlay.

- [ ] **Step 2: Commit**

```bash
git add src/components/creative/creative-output-edit-card.tsx
git commit -m "Add loading overlay to creative cards"
```

---

### Task 10: Enrich audience card content

**Files:**
- Modify: `src/components/audience/audience-card.tsx`
- Modify: `src/components/audience/audience-card-with-count.tsx`

Cards are too sparse. Add: audience category (from filters), filter count summary, and creation date.

- [ ] **Step 1: Add more content to AudienceCard**

Update the `Props` interface to accept optional `filterCount` (number of active filters). Add to `CardContent`:

- Number of active filters as a pill/badge (e.g., "3 filters")
- Relative creation date (e.g., "Created 2 hours ago")

Keep the card compact but informative. Example structure:

```tsx
<CardContent>
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Users className="size-3.5" />
        {respondentCount} respondents
      </span>
      {filterCount > 0 && (
        <span className="flex items-center gap-1">
          <Filter className="size-3.5" />
          {filterCount} filters
        </span>
      )}
    </div>
    <p className="text-xs text-muted-foreground">
      {new Date(audience.createdAt).toLocaleDateString()}
    </p>
  </div>
</CardContent>
```

- [ ] **Step 2: Pass filter count from AudienceCardWithCount**

In `audience-card-with-count.tsx`, compute the filter count from the audience's filters object and pass it to `AudienceCard`.

- [ ] **Step 3: Commit**

```bash
git add src/components/audience/audience-card.tsx src/components/audience/audience-card-with-count.tsx
git commit -m "Enrich audience card content"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run lint and typecheck**

```bash
npm run lint && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Visual verification**

Start dev server, log in, verify:
- Sidebar: Dashboard first, Light brand visible
- Dashboard: Two-column layout, genre chart sorted correctly, data table readable
- Respondent table: Visible borders, distinct expansion panels
- Filters: Readable, visually grouped
- Creative: No duplicate cards, loading indicator during generation, single-column history
- Audience cards: Show filter count and date
- Auto-select works when loading /creative directly
