# Light - Brainstorm Summary

## What are we building?

Light - a lightweight audience insights platform for marketers. A tool where someone in a marketing department can browse survey respondents, group them into audiences, see what content genres each audience cares about, use AI to generate creative ideas based on those interests, and save their work.

## Why?

A marketer needs to go from "here's raw survey data" to "here's a creative campaign idea for this specific group of people." This tool makes that journey visual, fast, and AI-assisted.

---

## Q&A

### Q1: What should the app navigation structure look like?

Three separate pages with a sidebar:

- `/respondents` - browse and inspect individual survey respondents
- `/dashboard` - pick/create an audience, see genre insights
- `/creative` - run AI creative workflows using the selected audience's data

The selected audience carries over between dashboard and creative via a Zustand store.

### Q2: What should the Respondent Explorer show?

A table with 6 columns at a glance:

- Respondent ID
- Audience Category
- Age
- Gender
- Region + State
- Household Income

All remaining fields (ethnicity, community type, marital status, household size, education, employment status, investable assets, zip code, DMA, parent status, political affiliation, home ownership, wave, wave ID, weight) are hidden in an expandable detail panel per row.

### Q3: How should users create audiences?

Filter-based as the primary method with manual overrides as an advanced option:

- Filters are the primary driver (determine who's in the audience)
- Users can force-include or force-exclude specific respondents on top of filters
- Manually added respondents show a "Manually added" badge
- Manually excluded respondents are hidden from the list with a clickable "3 excluded" count that reveals them with the ability to add them back
- Stored as JSON: `{ "filters": [...], "manualIncludes": [...], "manualExcludes": [...] }`

### Q4: Which fields should be filterable?

Top 4 always visible:

1. Audience Category (dropdown)
2. Age (range)
3. Gender (multi-select)
4. Region (multi-select)

Behind "Advanced Filters" toggle:

- State, Community Type, Household Income, Parent Status, Education, Employment Status, Home Ownership

### Q5: How should genre insights be calculated and visualized?

Calculation: Both average score (for ranking) and % highly interested (as secondary metric). Genres ranked by average interest score (lower = better). % highly interested = percentage of audience that rated 1 or 2.

Visualization: Horizontal bar chart.

### Q6: Show all genres or just the top ones?

Top 5 by default with a "Show more" button to reveal the rest. Designed for scale (hundreds of genres).

### Q7: What else should the dashboard show besides genre insights?

Just audience selection/creation + genre insights. No demographic summary. V1 per spec only.

### Q8: Which creative workflows should we build?

Four workflows covering different strategic questions:

1. **Audience Persona Snapshot** (WHO) - AI synthesizes demographics + genre interests into a readable one-page profile
2. **Campaign Concepts** (WHAT) - AI generates 3-5 campaign concepts tailored to the audience
3. **Messaging Angles** (HOW) - AI suggests 3-5 messaging approaches with tone, hooks, emotional framing
4. **Content Opportunity Finder** (WHERE IS THE GAP) - Analyzes neutral/low interest genres crossed with audience traits to find untapped opportunities

Each workflow produces structured, visually designed output - not raw text.

### Q9: How should AI output be validated and editable?

Three editing capabilities:

1. **Regenerate** - full regeneration of all output
2. **Manual inline edit** - click on any text field and edit directly
3. **Edit with AI (hybrid)** - preset refinement buttons + freeform text field constrained by system prompt

Preset refinements are contextual to each workflow type:

- **Persona**: "Add more detail", "Make it shorter", "Focus on lifestyle habits", "Focus on media consumption", "Emphasize demographics"
- **Campaign Concepts**: "Make it bolder", "Make it safer", "Add more detail", "Make it shorter", "Focus on [genre]", "Target different format"
- **Messaging Angles**: "Make it more emotional", "Make it more data-driven", "Add more detail", "Make it shorter", "Focus on [genre]", "Shift hook to [trait]"
- **Content Opportunities**: "Add more detail", "Make it shorter", "Explore deeper", "Focus on [genre]", "Suggest more crossover ideas"

Freeform input is constrained by system prompt to only allow refinements relevant to the audience data.

### Q10: How should saved work be organized?

Auto-save everything. No manual "save" button. Content organized by audience. User deletes what they don't want. Follows industry standard (Jasper, Notion, Figma pattern).

- Dashboard shows saved audiences as cards
- Creative page shows all previously generated outputs for the selected audience, organized by workflow type
- User can create new outputs or revisit/edit old ones

### Q11: Do we need user accounts?

Yes. Supabase Auth with email/password. Sign in + sign up pages (tab toggle). No forgot password for v1.

### Q12: What is the database schema?

Six tables with hybrid approach (regular columns for quelightble fields, JSONB for flexible content):

**Seed data tables:**

- `respondents` - all 22 CSV fields as typed columns. B-tree indexes on all filterable fields (audience_category, age, gender, region, state, community_type, household_income_usd, parent_status, education, employment_status, home_ownership).
- `genres` - slug (PK), name, categories (text array). Minimal indexing.
- `respondent_genre_interests` - composite PK on (respondent_id, genre_slug). B-tree indexes on (genre_slug, interest_level), respondent_id, genre_slug.

**User-created data tables:**

- `audiences` - id, user_id, name, filters (JSONB), manual_includes (UUID array), manual_excludes (UUID array), created_at, updated_at. Indexes: B-tree on user_id, composite on (user_id, updated_at DESC).
- `audience_genre_summaries` - id, audience_id, genre_slug, avg_interest, pct_highly_interested, respondent_count, computed_at. Recomputed when audience is created/updated. Indexes: composite on (audience_id, avg_interest), B-tree on audience_id.
- `creative_outputs` - single table with type discriminator (persona, campaign, messaging, opportunity). id, user_id, audience_id, type, content (JSONB), created_at, updated_at. Indexes: B-tree on user_id, composite on (audience_id, type), composite on (user_id, type, updated_at DESC).

### Q13: What are the RLS policies?

- **Seed data tables** (respondents, genres, respondent_genre_interests): SELECT only for authenticated users. No INSERT/UPDATE/DELETE.
- **audiences**: Full CRUD scoped to `user_id = auth.uid()`.
- **audience_genre_summaries**: SELECT where `audience_id IN (SELECT id FROM audiences WHERE user_id = auth.uid())`. Write operations via service role key only.
- **creative_outputs**: Full CRUD scoped to `user_id = auth.uid()`.

Cross-user access prevented through direct ownership checks and ownership chain verification for summary table.

### Q14: What API routes do we need?

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/respondents` | GET | List respondents (paginated, filterable) |
| `/api/respondents/[id]` | GET | Single respondent with genre interests |
| `/api/genres` | GET | List all genres |
| `/api/audiences` | GET | List user's audiences |
| `/api/audiences` | POST | Create audience (triggers genre summary computation) |
| `/api/audiences/[id]` | GET | Single audience with matched respondents |
| `/api/audiences/[id]` | PATCH | Update audience (triggers genre summary recomputation) |
| `/api/audiences/[id]` | DELETE | Delete audience |
| `/api/audiences/[id]/insights` | GET | Precomputed genre summaries |
| `/api/creative` | GET | List creative outputs (filterable by audience_id, type) |
| `/api/creative` | POST | Generate new creative output (streams via AI SDK) |
| `/api/creative/[id]` | GET | Single creative output |
| `/api/creative/[id]` | PATCH | Update creative output (inline or AI edit) |
| `/api/creative/[id]` | DELETE | Delete creative output |

### Q15: How do we handle AI generation timeouts?

Streaming via Vercel AI SDK's `streamObject()`. Tokens stream to the client in real-time as OpenAI generates them. Output is structured JSON validated with Zod schemas. Auto-saved to database when stream completes. `maxDuration: 60` as safety net.

### Q16: What does the sidebar look like?

Togglable sidebar using shadcn's prebuilt Sidebar component. Can be minimized (icons only) or expanded (icons + labels). Three nav items: Respondents, Dashboard, Creative. Bottom section: user avatar/email + sign out.

### Q17: How does pagination work on the respondent table?

URL-based page numbers (e.g. `/respondents?page=3`). Shareable and bookmarkable. No search bar for v1.

### Q18: What auth screens do we need?

Sign in + sign up on the same page with tab toggle. No forgot password. Unauthenticated users redirect to auth page.

### Q19: How does the setup process work?

Single command: `npm run setup`

1. Script prompts for OpenAI API key (optional, press Enter to skip)
2. Starts Supabase via Docker (`supabase start`)
3. Captures Supabase credentials from `supabase status`
4. Writes `.env.local` with all values (including OpenAI key if provided)
5. Runs `supabase db reset` (applies migrations + seed.sql)
6. Starts dev server

If OpenAI key is skipped, creative page shows a notice instead of crashing.

### Q20: What data is in seed.sql?

- Default user: john@example.com / password123
- 12 respondents from CSV
- 10 genres from CSV
- 120 interest ratings from CSV
- 1 sample audience ("Wellness-Oriented Parents") for the default user
- Precomputed genre summaries for the sample audience
- 1 pre-generated persona snapshot
- 1 pre-generated campaign concept
- 1 pre-generated messaging angle
- 1 pre-generated content opportunity

### Q21: How is error handling done?

- All notifications via Sonner toasts (shadcn built-in)
- Success (green): "Audience saved", "Concept generated"
- Error (red): "Failed to save audience", "AI generation failed"
- Info (default): "OpenAI key not configured"
- Warning (yellow): "No respondents match these filters"
- Loading states: skeleton components (no spinners, no "Loading..." text)
- Empty states: contextual prompts guiding users to take action
- AI stream failure: error message with "Try again" button, partial output not saved
