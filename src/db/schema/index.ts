import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Seed-data tables
// ---------------------------------------------------------------------------

export const respondents = pgTable(
  'respondents',
  {
    respondentId: integer('respondent_id').primaryKey(),
    wave: integer('wave').notNull(),
    waveId: integer('wave_id').notNull(),
    weight: numeric('weight').notNull(),
    audienceCategory: text('audience_category').notNull(),
    age: integer('age').notNull(),
    gender: text('gender').notNull(),
    ethnicity: text('ethnicity').notNull(),
    region: text('region').notNull(),
    communityType: text('community_type').notNull(),
    maritalStatus: text('marital_status').notNull(),
    householdSize: integer('household_size').notNull(),
    education: text('education').notNull(),
    employmentStatus: text('employment_status').notNull(),
    householdIncomeUsd: integer('household_income_usd').notNull(),
    investableAssetsUsd: integer('investable_assets_usd').notNull(),
    zipCode: text('zip_code').notNull(),
    state: text('state').notNull(),
    dma: text('dma').notNull(),
    parentStatus: text('parent_status').notNull(),
    politicalAffiliation: text('political_affiliation').notNull(),
    homeOwnership: text('home_ownership').notNull(),
  },
  (table) => [
    index('respondents_audience_category_idx').on(table.audienceCategory),
    index('respondents_age_idx').on(table.age),
    index('respondents_gender_idx').on(table.gender),
    index('respondents_region_idx').on(table.region),
    index('respondents_state_idx').on(table.state),
    index('respondents_community_type_idx').on(table.communityType),
    index('respondents_household_income_usd_idx').on(table.householdIncomeUsd),
    index('respondents_parent_status_idx').on(table.parentStatus),
    index('respondents_education_idx').on(table.education),
    index('respondents_employment_status_idx').on(table.employmentStatus),
    index('respondents_home_ownership_idx').on(table.homeOwnership),
  ],
);

export const genres = pgTable('genres', {
  genreSlug: text('genre_slug').primaryKey(),
  genreName: text('genre_name').notNull(),
  genreCategories: text('genre_categories').array().notNull(),
});

export const respondentGenreInterests = pgTable(
  'respondent_genre_interests',
  {
    respondentId: integer('respondent_id')
      .notNull()
      .references(() => respondents.respondentId),
    genreSlug: text('genre_slug')
      .notNull()
      .references(() => genres.genreSlug),
    interestLevel: smallint('interest_level').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.respondentId, table.genreSlug] }),
    index('rgi_genre_interest_idx').on(table.genreSlug, table.interestLevel),
    index('rgi_respondent_id_idx').on(table.respondentId),
    index('rgi_genre_slug_idx').on(table.genreSlug),
  ],
);

// ---------------------------------------------------------------------------
// User-data tables
// ---------------------------------------------------------------------------

export const audiences = pgTable(
  'audiences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    filters: jsonb('filters'),
    manualIncludes: integer('manual_includes').array(),
    manualExcludes: integer('manual_excludes').array(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audiences_user_id_idx').on(table.userId),
    index('audiences_user_id_updated_at_idx').on(
      table.userId,
      table.updatedAt.desc(),
    ),
  ],
);

export const audienceGenreSummaries = pgTable(
  'audience_genre_summaries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    audienceId: uuid('audience_id')
      .notNull()
      .references(() => audiences.id, { onDelete: 'cascade' }),
    genreSlug: text('genre_slug')
      .notNull()
      .references(() => genres.genreSlug),
    avgInterest: numeric('avg_interest').notNull(),
    pctHighlyInterested: numeric('pct_highly_interested').notNull(),
    respondentCount: integer('respondent_count').notNull(),
    computedAt: timestamp('computed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('ags_audience_avg_interest_idx').on(
      table.audienceId,
      table.avgInterest,
    ),
    index('ags_audience_id_idx').on(table.audienceId),
  ],
);

export const creativeOutputs = pgTable(
  'creative_outputs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    audienceId: uuid('audience_id')
      .notNull()
      .references(() => audiences.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('creative_outputs_user_id_idx').on(table.userId),
    index('creative_outputs_audience_type_idx').on(
      table.audienceId,
      table.type,
    ),
    index('creative_outputs_user_type_updated_idx').on(
      table.userId,
      table.type,
      table.updatedAt.desc(),
    ),
  ],
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------

export type Respondent = InferSelectModel<typeof respondents>;
export type NewRespondent = InferInsertModel<typeof respondents>;

export type Genre = InferSelectModel<typeof genres>;
export type NewGenre = InferInsertModel<typeof genres>;

export type RespondentGenreInterest = InferSelectModel<
  typeof respondentGenreInterests
>;
export type NewRespondentGenreInterest = InferInsertModel<
  typeof respondentGenreInterests
>;

export type Audience = InferSelectModel<typeof audiences>;
export type NewAudience = InferInsertModel<typeof audiences>;

export type AudienceGenreSummary = InferSelectModel<
  typeof audienceGenreSummaries
>;
export type NewAudienceGenreSummary = InferInsertModel<
  typeof audienceGenreSummaries
>;

export type CreativeOutput = InferSelectModel<typeof creativeOutputs>;
export type NewCreativeOutput = InferInsertModel<typeof creativeOutputs>;
