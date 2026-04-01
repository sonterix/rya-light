# Light

**Status:** Draft
**Date:** 2026-04-01
**Author:**

---

## 1. Overview

Light is a lightweight audience insights platform that helps marketers move from raw survey data to actionable creative output. The application lets users browse survey respondents, group them into reusable audiences based on demographic filters, explore what content genres those audiences care about, and then use AI to generate creative deliverables grounded in real audience data. All work is automatically saved and tied to the user's account, so they can return to it at any time.

## 2. Problem Statement

Marketers working with survey data today face a fragmented workflow. They receive spreadsheets full of respondent demographics and genre interest ratings, then must manually sift through rows to identify patterns, build audience segments by hand, and come up with creative campaign ideas on their own. There is no single tool that connects the dots between "who is this audience," "what do they care about," and "what creative direction should we take." This manual process is slow, error-prone, and disconnects the data from the creative output it should inform.

## 3. Goals

- A marketer can go from raw respondent data to a generated creative deliverable in under five minutes.
- Audiences are reusable: once created, they persist and can be revisited across sessions.
- Genre insights for any audience are immediately visible without manual calculation.
- Every AI-generated output is clearly grounded in real audience data, not generic prompting.
- A reviewer can set up and run the entire application with a single command and a pre-created demo account.

## 4. User Roles

- **Marketer**: A strategist or marketing professional at a large company who needs to understand audiences, explore their interests, and generate creative campaign ideas based on survey data. They are not technical and expect a visual, intuitive interface.

## 5. User Stories

### Authentication

1. As a marketer, I want to sign up with my email and password, so that I have my own private workspace.
2. As a marketer, I want to sign in with my existing credentials, so that I can access my saved audiences and creative outputs.
3. As a marketer, I want to be redirected to the sign-in page when I visit the app without being authenticated, so that my data stays private.
4. As a marketer, I want to sign out from the sidebar, so that I can secure my session when I'm done.

### Navigation

5. As a marketer, I want a sidebar with links to Respondents, Dashboard, and Creative, so that I can move between the main areas of the app.
6. As a marketer, I want to toggle the sidebar between expanded (icons and labels) and minimized (icons only), so that I can reclaim screen space when I need it.

### Respondent Explorer

7. As a marketer, I want to see a table of all respondents showing their audience category, age, gender, region, state, and household income, so that I can quickly scan who is in the dataset.
8. As a marketer, I want to expand a respondent row to see all of their details (ethnicity, community type, marital status, household size, education, employment status, investable assets, zip code, DMA, parent status, political affiliation, home ownership), so that I can dig deeper when needed.
9. As a marketer, I want to paginate through respondents using page numbers in the URL, so that I can share a specific page with a colleague by sending them the link.
10. As a marketer, I want to see skeleton placeholders while the respondent data is loading, so that the page feels responsive.
11. As a marketer, I want to see a contextual empty state if there are no respondents, so that I understand the data hasn't been loaded yet.

### Audience Builder

12. As a marketer, I want to create a new audience by giving it a name and setting filters, so that I can define a reusable group of respondents.
13. As a marketer, I want to filter respondents by audience category, age range, gender, and region using always-visible filter controls, so that I can quickly build common segments.
14. As a marketer, I want to access additional filters (state, community type, household income, parent status, education, employment status, home ownership) behind an "Advanced Filters" toggle, so that the interface stays clean for simple use cases.
15. As a marketer, I want to see matching respondents update in real time as I adjust filters, so that I can refine my audience interactively.
16. As a marketer, I want to manually include a specific respondent who does not match my filters, so that I can override the rules for special cases.
17. As a marketer, I want manually included respondents to display a "Manually added" badge, so that I can distinguish them from filter-matched respondents.
18. As a marketer, I want to manually exclude a specific respondent who matches my filters, so that I can remove outliers without changing the filter rules.
19. As a marketer, I want manually excluded respondents to be hidden from the main list with a clickable count (e.g., "3 excluded"), so that they don't create visual noise.
20. As a marketer, I want to click the excluded count to see the excluded respondents and add them back if I change my mind, so that exclusions are reversible.
21. As a marketer, I want to see a warning when my filters match zero respondents, so that I know to adjust my criteria.
22. As a marketer, I want my audiences to be automatically saved whenever I create or edit them, so that I never lose my work.
23. As a marketer, I want to see all my saved audiences as cards on the dashboard, so that I can quickly pick one to work with.
24. As a marketer, I want to select an audience to make it the active context for genre insights and creative workflows, so that everything I see is specific to that group.
25. As a marketer, I want to delete an audience I no longer need, so that my workspace stays organized.

### Genre Insights

26. As a marketer, I want to see a horizontal bar chart of the top 5 genres for my selected audience ranked by average interest score, so that I immediately know what this group cares about most.
27. As a marketer, I want each bar in the chart to also show the percentage of the audience that rated it as highly interested, so that I have both a ranking and a human-readable stat.
28. As a marketer, I want a "Show more" button below the top 5 to reveal all remaining genres, so that I can see the full picture when I need it.
29. As a marketer, I want genre insights to load from precomputed data rather than calculating on the fly, so that the dashboard feels fast even with large datasets.
30. As a marketer, I want genre insights to automatically recompute when I update an audience's filters or manual overrides, so that the data always reflects the current audience definition.

### Creative Workflows - General

31. As a marketer, I want to navigate to the Creative page and see my selected audience's context carried over from the dashboard, so that I don't have to re-select it.
32. As a marketer, I want to see a prompt to go to the dashboard and select an audience if none is currently active, so that I know what to do first.
33. As a marketer, I want to choose between four creative workflow types: Audience Persona, Campaign Concepts, Messaging Angles, and Content Opportunities, so that I can pick the one that fits my current need.
34. As a marketer, I want all generated creative outputs to be automatically saved, so that I can revisit them later without manually saving.
35. As a marketer, I want to see all previously generated outputs for my selected audience organized by workflow type, so that I have a history of everything created for this group.
36. As a marketer, I want to delete a creative output I no longer need, so that my workspace stays clean.
37. As a marketer, I want AI-generated content to stream in progressively as it is being generated, so that I see results appearing in real time instead of waiting for a blank screen.
38. As a marketer, I want to see a clear error message with a "Try again" button if AI generation fails mid-stream, so that I can recover without confusion.
39. As a marketer, I want the creative page to show a notice explaining how to add the OpenAI key if it hasn't been configured, so that I understand why AI features aren't available.

### Creative Workflow - Audience Persona Snapshot

40. As a marketer, I want to generate a one-page audience persona that includes a persona name, demographic summary, top interests, lifestyle description, and a "how to reach them" blurb, so that I can share a clear picture of who this audience is with my team.
41. As a marketer, I want the persona to be presented as a visually designed card layout with sections, genre interest badges, and demographic stats, so that it looks polished enough to share with stakeholders.

### Creative Workflow - Campaign Concepts

42. As a marketer, I want to generate 3-5 campaign concepts, each with a concept name, tagline, description, target genres it leverages, and a suggested format, so that I have concrete creative starting points.
43. As a marketer, I want each concept displayed as its own card with genre tags showing which audience interests it draws from, so that I can see the data connection at a glance.

### Creative Workflow - Messaging Angles

44. As a marketer, I want to generate 3-5 messaging angles, each with an angle name, tone descriptor, sample headline, emotional hook, and the key audience trait it leverages, so that I have different ways to frame my communication.
45. As a marketer, I want each angle displayed as a card with the specific genre or trait connection highlighted, so that the reasoning behind each suggestion is transparent.

### Creative Workflow - Content Opportunity Finder

46. As a marketer, I want to see content opportunities that cross-reference genres the audience rates as neutral or low-interest with their demographic traits, so that I can find non-obvious creative angles that competitors are likely missing.
47. As a marketer, I want each opportunity displayed as a card with the gap genre, the audience trait that creates the opportunity, a suggested crossover concept, and a confidence indicator, so that I can prioritize which opportunities to explore.

### Creative Output Editing

48. As a marketer, I want to regenerate an entire creative output to get a fresh set of results, so that I'm not stuck with the first generation.
49. As a marketer, I want to click on any text field in a creative output and edit it directly, so that I can tweak the AI's work to match my voice.
50. As a marketer, I want to refine a creative output using preset buttons specific to that workflow type (e.g., "Make it bolder" for campaign concepts, "Make it more emotional" for messaging angles), so that I can quickly adjust without typing a prompt.
51. As a marketer, I want to type a freeform refinement prompt to adjust a creative output in ways the presets don't cover, so that I have full control when I need it.
52. As a marketer, I want freeform refinement prompts to be constrained to modifications relevant to the audience data, so that the output stays grounded and doesn't drift into unrelated territory.

### Notifications and Feedback

53. As a marketer, I want to see a success toast when an action completes (e.g., audience saved, concept generated), so that I know it worked.
54. As a marketer, I want to see an error toast when something fails (e.g., network error, generation failure), so that I know something went wrong and can try again.
55. As a marketer, I want to see skeleton loading states instead of spinners or "Loading..." text while data is being fetched, so that the interface feels fast and polished.

### Data Privacy

56. As a marketer, I want my audiences and creative outputs to be visible only to me, so that my work is private.
57. As a marketer, I want to be unable to see, edit, or delete another user's audiences or creative outputs, so that there is no risk of cross-user data access.

### Setup and Onboarding

58. As a reviewer, I want to run a single command to start the entire application (database, seed data, dev server), so that I can evaluate the app without manual configuration.
59. As a reviewer, I want the setup script to prompt me for my OpenAI API key before starting, so that AI features work immediately after setup.
60. As a reviewer, I want the setup script to skip the OpenAI key if I press Enter, so that I can still evaluate non-AI features without it.
61. As a reviewer, I want a pre-created demo account (john@example.com / password123) with sample data already loaded, so that I can sign in and see a fully populated app immediately.
62. As a reviewer, I want the demo account to have one sample audience with precomputed genre insights and one of each creative output type, so that every section of the app has visible content on first login.

## 6. Functional Requirements

### Authentication

1. The system must support email/password registration and login using Supabase Auth.
2. The sign-in and sign-up forms must appear on the same page, switchable via a tab toggle.
3. When an unauthenticated user visits any page, the system must redirect them to the authentication page.
4. The sidebar must display the current user's email and a sign-out option at the bottom.

### Navigation

5. The application must have a left sidebar with three navigation items: Respondents, Dashboard, and Creative.
6. The sidebar must be togglable between expanded state (icons with labels) and minimized state (icons only), using the prebuilt shadcn Sidebar component.

### Respondent Explorer

7. The respondent table must display six columns: Respondent ID, Audience Category, Age, Gender, Region + State (combined), and Household Income.
8. Each row must be expandable to reveal all remaining respondent fields in a detail panel.
9. The table must use URL-based page number pagination (e.g., /respondents?page=3).
10. The table must display skeleton placeholders while data is loading.
11. The table must display a contextual empty state message when no respondents exist.

### Audience Builder

12. Users must be able to create a named audience by setting demographic filters.
13. Four filters must be always visible: Audience Category (dropdown), Age (range), Gender (multi-select), and Region (multi-select).
14. Seven additional filters must be accessible behind an "Advanced Filters" toggle: State, Community Type, Household Income, Parent Status, Education, Employment Status, and Home Ownership.
15. The list of matching respondents must update in real time as the user adjusts filters.
16. Users must be able to manually include respondents who don't match the active filters.
17. Manually included respondents must display a "Manually added" badge in the respondent list.
18. Users must be able to manually exclude respondents who match the active filters.
19. Manually excluded respondents must not appear in the main respondent list. Instead, a clickable count (e.g., "3 excluded") must be shown.
20. Clicking the excluded count must reveal the excluded respondents with the option to re-include each one.
21. When filters match zero respondents, the system must display a warning message.
22. Audiences must be automatically saved on creation and on every edit (filter change, name change, manual override change).
23. The dashboard must display all saved audiences as cards.
24. Selecting an audience must set it as the active context used by genre insights and creative workflows.
25. Users must be able to delete an audience. Deleting an audience must also delete its associated genre summaries and creative outputs.

### Genre Insights

26. When an audience is selected, the dashboard must display a horizontal bar chart of the top 5 genres ranked by average interest score (lowest score = highest interest).
27. Each bar must also display the percentage of the audience that rated the genre as highly interested (interest level 1 or 2).
28. A "Show more" button must appear below the chart. Clicking it must reveal all remaining genres.
29. Genre insights must be served from a precomputed summary table, not calculated on every page load.
30. The system must recompute genre summaries whenever an audience is created, or its filters or manual overrides are updated.

### Creative Workflows - General

31. The creative page must carry over the currently selected audience from the dashboard without requiring re-selection.
32. If no audience is selected, the creative page must display a prompt directing the user to the dashboard to select or create one.
33. The creative page must offer four workflow types: Audience Persona Snapshot, Campaign Concepts, Messaging Angles, and Content Opportunity Finder.
34. All generated creative outputs must be automatically saved to the database when the generation stream completes.
35. The creative page must display all previously generated outputs for the selected audience, grouped by workflow type.
36. Users must be able to delete individual creative outputs.
37. AI generation must use streaming so that output appears progressively in real time.
38. If AI generation fails mid-stream, the system must display an error message with a "Try again" button and must not save partial output.
39. If the OpenAI API key is not configured, the creative page must display a notice explaining how to add it, and all generation buttons must be disabled.

### Creative Workflow - Audience Persona Snapshot

40. The generated persona must include: a persona name, a demographic summary, a list of top interests, a lifestyle description, and a "how to reach them" blurb.
41. The persona must be rendered as a visually structured card layout with distinct sections, genre interest badges with color coding, and demographic stats with icons.

### Creative Workflow - Campaign Concepts

42. The system must generate 3-5 campaign concepts per request. Each concept must include: a concept name, a tagline, a description, the target genres it leverages, and a suggested content format.
43. Each concept must be displayed as its own card with genre tags visually linking it to the audience interests it draws from.

### Creative Workflow - Messaging Angles

44. The system must generate 3-5 messaging angles per request. Each angle must include: an angle name, a tone descriptor, a sample headline, an emotional hook, and the key audience trait it leverages.
45. Each angle must be displayed as a card with the specific genre or demographic trait connection highlighted.

### Creative Workflow - Content Opportunity Finder

46. The system must analyze genres the audience rates as neutral (3) or low interest (4-5) and cross-reference them with the audience's demographic traits to identify non-obvious creative opportunities.
47. Each opportunity must include: the gap genre, the audience trait that creates the opportunity, a suggested crossover concept, and a confidence indicator (high, medium, or low).

### Creative Output Editing

48. Each creative output must have a "Regenerate" button that replaces all content with a fresh generation.
49. All text fields within a creative output must be directly editable by clicking on them (inline editing).
50. Each workflow type must display preset refinement buttons relevant to that output type:
    - Persona: "Add more detail", "Make it shorter", "Focus on lifestyle habits", "Focus on media consumption", "Emphasize demographics"
    - Campaign Concepts: "Make it bolder", "Make it safer", "Add more detail", "Make it shorter", "Focus on [genre]", "Target different format"
    - Messaging Angles: "Make it more emotional", "Make it more data-driven", "Add more detail", "Make it shorter", "Focus on [genre]", "Shift hook to [trait]"
    - Content Opportunities: "Add more detail", "Make it shorter", "Explore deeper", "Focus on [genre]", "Suggest more crossover ideas"
51. Each creative output must have a freeform text input for custom refinement prompts.
52. Freeform refinement prompts must be constrained by a system-level instruction that limits modifications to the audience data context. If a user submits an off-topic prompt, the system must respond with a message indicating it can only refine the output based on the audience data.

### Notifications

53. The system must display a success toast when a user action completes successfully (e.g., audience created, output generated, output deleted).
54. The system must display an error toast when a user action fails (e.g., network error, server error, AI generation failure).
55. All data-loading states must use skeleton components. No spinners or "Loading..." text.

### Data Privacy

56. Each user's audiences, genre summaries, and creative outputs must be isolated to that user. No user may read, modify, or delete another user's data.
57. Seed data (respondents, genres, and interest ratings) must be readable by all authenticated users and writable by no one.

### Setup

58. A single command (`npm run setup`) must start the database, seed it with data, and start the development server.
59. The setup script must prompt the user for an OpenAI API key before starting, with the option to skip by pressing Enter.
60. The setup script must automatically capture Supabase credentials and write them to the environment configuration file.
61. The seed data must include a pre-created user account (john@example.com / password123) with one sample audience ("Wellness-Oriented Parents"), precomputed genre summaries for that audience, and one pre-generated output for each of the four creative workflow types.

## 7. Out of Scope

- Forgot password / password reset flow
- OAuth or social login providers
- Demographic summary section on the dashboard
- Search bar on the respondent table
- Infinite scroll or "load more" pagination
- Regenerating a single item within a creative output (only full regeneration)
- Rating or favoriting individual creative outputs
- Sharing audiences or creative outputs between users
- Exporting data to CSV, PDF, or other formats
- Real-time collaboration or multi-user editing
- Mobile-responsive layout
- Dark mode toggle (the design system supports it but there is no toggle in v1)
- Custom genre or respondent data upload by users
- Deployment to production hosting

## 8. Assumptions

- The dataset will grow to thousands of respondents and hundreds of genres, so the system should be designed for that scale even though the seed data is small.
- Supabase local development via Docker is available on the reviewer's machine.
- The reviewer has access to an OpenAI API key for testing creative workflows.
- Email/password authentication is sufficient; no enterprise SSO is required.
- The interest level scale (1 = highest interest, 5 = unfamiliar) is fixed and will not change.
- A single "marketer" role is sufficient; there are no admin users, viewer-only users, or team hierarchies.
- The precomputed genre summary table is an acceptable tradeoff between query speed and data freshness, since summaries are recomputed on every audience change.
- Auto-saving all creative outputs is preferable to requiring manual saves, based on industry-standard patterns in tools like Jasper, Notion, and Figma.
- The freeform AI refinement prompt can be adequately constrained by system-level instructions without needing a content moderation layer.
