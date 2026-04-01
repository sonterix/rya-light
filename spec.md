# Take-Home: Light

## Summary

Your task is to build a lightweight version of the light platform and share a GitHub repository. To help us review and test your work, please configure the repo to run Supabase locally.

This is intentionally open-ended. We are not looking for one "correct" answer. A big part of this role is taking ambiguous product goals, shaping the problem, and making good implementation decisions quickly.

Please document your assumptions and key decisions as you go. We care a lot about how you think.

Your submission must include:

- `Supabase Configuration`: an initialized local Supabase environment
- `Migrations`: the migration files required to generate your database schema
- `Seed Data`: a `seed.sql` file, or equivalent script, that automatically imports the provided `.csv` files to populate the local database
- `Run Instructions`: clear steps in this README on how to start the database and run the application

---

Someone in the marketing department at a large company will use this product to:

- understand who is in an audience
- explore what genres and topics that audience is interested in
- generate creative ideas based on those audience signals

## Expectations

The core project should take about 2-4 hours.

W're very familiar with how powerful current AI models are, so we consider a good vibecoded product to be the bare minimum.

## Goal

Build a React or Next.js app backed by Supabase that uses the provided survey data to:

1. showcase respondent information
2. surface genres of interest for an audience
3. support at least two creative workflows that use those audience insights
4. save user-created outputs back to Supabase

## Scenario

Imagine a strategist or marketer is trying to answer questions like:

- "Who is this audience?"
- "What kinds of content or genres do they care about?"
- "What creative angles should we test for this audience?"

Your app should help them move from raw respondent data to useful creative output.

## What To Build

### 1. Respondent Explorer

Create a way to browse and inspect respondents from the provided CSV data.

### 2. Audience Or Segment Builder

Let the user create a saved audience or working segment from the respondent data.

This can be:

- a saved filter set
- a named audience generated from selected respondents
- a dynamic segment definition stored as JSON in Supabase

There is no single right approach. Pick something sensible and explain why.

### 3. Genre Insights

Use the provided survey genre-interest data to highlight what the selected audience cares about.

At minimum, show:

- top genres for the audience

For reference, the provided `interest_level` values use this scale:

- `1` = highest interest
- `2` = interested
- `3` = neutral
- `4` = low interest
- `5` = unfamiliar / not meaningfully interested

### 4. Creative Workflows

Build at least **two** creative use cases powered by the audience data.

Pick any two, or invent your own:

- generate campaign concepts for a selected audience
- generate a one-page audience summary or persona snapshot
- suggest messaging angles based on top genres and demographics
- suggest channels or content formats to test
- remix an existing concept into a new angle
- create a "white space" view that combines audience traits with underused genres

Each creative workflow should clearly use the audience or genre data, not just generic prompting.

### 5. Persistence

Save at least one user-created artifact to Supabase so it can be revisited later.

Examples:

- saved audiences
- saved concepts
- saved briefs
- saved creative outputs

## Supabase Expectations

We want to see that the app is actually wired to a database and can be recreated from source control.

Please include:

- a Supabase schema or migrations
- import or seed instructions for the provided CSVs
- any RLS policies you think are appropriate
- setup notes so we can run the project against a fresh Supabase instance

You can use local Supabase, hosted Supabase, or both.

### Expected Environment Variables

At minimum, we expect a working solution to document:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If your implementation needs them, also document any additional values such as:

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` or another model provider key

## Provided Data

Files:

- `respondents.csv`
- `genres.csv`
- `respondent_genre_interest.csv`

We intentionally provided a cleaner, normalized version of the data for this exercise so you can spend your time on product and engineering decisions instead of parsing a very wide raw survey export.

The real platform uses related concepts such as:

- respondent records
- demographic responses
- genre responses
- audience-level genre summaries

## Expected Signal In The Sample Data

The sample dataset has a few intentionally distinct audience clusters. Your app does not need to hardcode these, but a good implementation should make them discoverable:

- `Emerging Tech Professionals` should trend toward `Coding / Robotics`, `How-To Content`, `Documentary`, and `Travel & tourism content`
- `Wellness-Oriented Parents` should trend toward `Cooking / Baking / Grilling`, `Meditation`, `Yoga / Pilates`, and `Travel & tourism content`
- `Competitive Sports Fans` should trend toward `Fantasy Sports` and `Reality programming / Reality TV`
- `Affluent Culture Seekers` should trend toward `Documentary`, `Wine`, and `Travel & tourism content`

## What To Submit

- URL to a usable application
- link to the source code
- Supabase schema or migrations
- brief setup instructions
- documented assumptions and key decisions

### AI Use

We assume you will use Cursor, Copilot, or similar tools to build this quickly. In your README, alongside your key decisions, please include a brief note on how you used AI for this project. What did it do perfectly? Where did it stumble, and how did you have to course-correct it?
