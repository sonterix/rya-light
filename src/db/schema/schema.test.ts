import { getTableConfig } from 'drizzle-orm/pg-core';

import {
  respondents,
  genres,
  respondentGenreInterests,
  audiences,
  audienceGenreSummaries,
  creativeOutputs,
} from './index';
import type {
  Respondent,
  NewRespondent,
  Genre,
  NewGenre,
  RespondentGenreInterest,
  NewRespondentGenreInterest,
  Audience,
  NewAudience,
  AudienceGenreSummary,
  NewAudienceGenreSummary,
  CreativeOutput,
  NewCreativeOutput,
} from './index';

function getColumnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((c) => c.name);
}

function getColumn(
  table: Parameters<typeof getTableConfig>[0],
  name: string,
) {
  return getTableConfig(table).columns.find((c) => c.name === name);
}

function getIndexNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).indexes.map((i) => i.config.name);
}

function getForeignKeyTableReferences(
  table: Parameters<typeof getTableConfig>[0],
) {
  return getTableConfig(table).foreignKeys.map((fk) => {
    const ref = fk.reference();
    return {
      columns: ref.columns.map((c) => c.name),
      foreignTable: getTableConfig(ref.foreignTable).name,
      foreignColumns: ref.foreignColumns.map((c) => c.name),
    };
  });
}

describe('respondents table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(respondents).name).toBe('respondents');
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(respondents);
    const expected = [
      'respondent_id',
      'wave',
      'wave_id',
      'weight',
      'audience_category',
      'age',
      'gender',
      'ethnicity',
      'region',
      'community_type',
      'marital_status',
      'household_size',
      'education',
      'employment_status',
      'household_income_usd',
      'investable_assets_usd',
      'zip_code',
      'state',
      'dma',
      'parent_status',
      'political_affiliation',
      'home_ownership',
    ];
    for (const col of expected) {
      expect(columns).toContain(col);
    }
  });

  it('should have respondent_id as primary key', () => {
    const col = getColumn(respondents, 'respondent_id');
    expect(col?.primary).toBe(true);
  });

  it('should have correct column types', () => {
    expect(getColumn(respondents, 'respondent_id')?.dataType).toBe('number');
    expect(getColumn(respondents, 'wave')?.dataType).toBe('number');
    expect(getColumn(respondents, 'wave_id')?.dataType).toBe('number');
    expect(getColumn(respondents, 'weight')?.dataType).toBe('string');
    expect(getColumn(respondents, 'audience_category')?.dataType).toBe(
      'string',
    );
    expect(getColumn(respondents, 'age')?.dataType).toBe('number');
    expect(getColumn(respondents, 'gender')?.dataType).toBe('string');
    expect(getColumn(respondents, 'household_size')?.dataType).toBe('number');
    expect(getColumn(respondents, 'household_income_usd')?.dataType).toBe(
      'number',
    );
    expect(getColumn(respondents, 'investable_assets_usd')?.dataType).toBe(
      'number',
    );
    expect(getColumn(respondents, 'zip_code')?.dataType).toBe('string');
  });

  it('should have the required indexes', () => {
    const indexNames = getIndexNames(respondents);
    expect(indexNames).toContain('respondents_audience_category_idx');
    expect(indexNames).toContain('respondents_age_idx');
    expect(indexNames).toContain('respondents_gender_idx');
    expect(indexNames).toContain('respondents_region_idx');
    expect(indexNames).toContain('respondents_state_idx');
    expect(indexNames).toContain('respondents_community_type_idx');
    expect(indexNames).toContain('respondents_household_income_usd_idx');
    expect(indexNames).toContain('respondents_parent_status_idx');
    expect(indexNames).toContain('respondents_education_idx');
    expect(indexNames).toContain('respondents_employment_status_idx');
    expect(indexNames).toContain('respondents_home_ownership_idx');
  });
});

describe('genres table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(genres).name).toBe('genres');
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(genres);
    expect(columns).toContain('genre_slug');
    expect(columns).toContain('genre_name');
    expect(columns).toContain('genre_categories');
  });

  it('should have genre_slug as primary key', () => {
    const col = getColumn(genres, 'genre_slug');
    expect(col?.primary).toBe(true);
  });

  it('should have genre_categories as a text array', () => {
    const col = getColumn(genres, 'genre_categories');
    expect(col?.dataType).toBe('array');
    expect(col?.columnType).toBe('PgArray');
  });
});

describe('respondent_genre_interests table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(respondentGenreInterests).name).toBe(
      'respondent_genre_interests',
    );
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(respondentGenreInterests);
    expect(columns).toContain('respondent_id');
    expect(columns).toContain('genre_slug');
    expect(columns).toContain('interest_level');
  });

  it('should have a composite primary key on (respondent_id, genre_slug)', () => {
    const config = getTableConfig(respondentGenreInterests);
    expect(config.primaryKeys.length).toBe(1);
    const pkColumns = config.primaryKeys[0].columns.map((c) => c.name);
    expect(pkColumns).toContain('respondent_id');
    expect(pkColumns).toContain('genre_slug');
  });

  it('should have foreign keys to respondents and genres', () => {
    const fks = getForeignKeyTableReferences(respondentGenreInterests);
    const respondentFK = fks.find((fk) => fk.foreignTable === 'respondents');
    const genreFK = fks.find((fk) => fk.foreignTable === 'genres');

    expect(respondentFK).toBeDefined();
    expect(respondentFK?.foreignColumns).toContain('respondent_id');
    expect(genreFK).toBeDefined();
    expect(genreFK?.foreignColumns).toContain('genre_slug');
  });

  it('should have interest_level as smallint', () => {
    const col = getColumn(respondentGenreInterests, 'interest_level');
    expect(col?.dataType).toBe('number');
    expect(col?.columnType).toBe('PgSmallInt');
  });

  it('should have the required indexes', () => {
    const indexNames = getIndexNames(respondentGenreInterests);
    expect(indexNames).toContain('rgi_genre_interest_idx');
    expect(indexNames).toContain('rgi_respondent_id_idx');
    expect(indexNames).toContain('rgi_genre_slug_idx');
  });
});

describe('audiences table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(audiences).name).toBe('audiences');
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(audiences);
    const expected = [
      'id',
      'user_id',
      'name',
      'filters',
      'manual_includes',
      'manual_excludes',
      'created_at',
      'updated_at',
    ];
    for (const col of expected) {
      expect(columns).toContain(col);
    }
  });

  it('should have id as UUID primary key', () => {
    const col = getColumn(audiences, 'id');
    expect(col?.primary).toBe(true);
    expect(col?.columnType).toBe('PgUUID');
  });

  it('should have user_id as UUID', () => {
    const col = getColumn(audiences, 'user_id');
    expect(col?.columnType).toBe('PgUUID');
    expect(col?.notNull).toBe(true);
  });

  it('should have filters as JSONB', () => {
    const col = getColumn(audiences, 'filters');
    expect(col?.columnType).toBe('PgJsonb');
  });

  it('should have manual_includes and manual_excludes as integer arrays', () => {
    const includes = getColumn(audiences, 'manual_includes');
    const excludes = getColumn(audiences, 'manual_excludes');
    expect(includes?.dataType).toBe('array');
    expect(excludes?.dataType).toBe('array');
  });

  it('should have timestamp columns with timezone', () => {
    const createdAt = getColumn(audiences, 'created_at');
    const updatedAt = getColumn(audiences, 'updated_at');
    expect(createdAt?.columnType).toBe('PgTimestamp');
    expect(updatedAt?.columnType).toBe('PgTimestamp');
  });

  it('should have the required indexes', () => {
    const indexNames = getIndexNames(audiences);
    expect(indexNames).toContain('audiences_user_id_idx');
    expect(indexNames).toContain('audiences_user_id_updated_at_idx');
  });
});

describe('audience_genre_summaries table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(audienceGenreSummaries).name).toBe(
      'audience_genre_summaries',
    );
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(audienceGenreSummaries);
    const expected = [
      'id',
      'audience_id',
      'genre_slug',
      'avg_interest',
      'pct_highly_interested',
      'respondent_count',
      'computed_at',
    ];
    for (const col of expected) {
      expect(columns).toContain(col);
    }
  });

  it('should have id as UUID primary key', () => {
    const col = getColumn(audienceGenreSummaries, 'id');
    expect(col?.primary).toBe(true);
    expect(col?.columnType).toBe('PgUUID');
  });

  it('should have foreign keys to audiences and genres', () => {
    const fks = getForeignKeyTableReferences(audienceGenreSummaries);
    const audienceFK = fks.find((fk) => fk.foreignTable === 'audiences');
    const genreFK = fks.find((fk) => fk.foreignTable === 'genres');

    expect(audienceFK).toBeDefined();
    expect(audienceFK?.foreignColumns).toContain('id');
    expect(genreFK).toBeDefined();
    expect(genreFK?.foreignColumns).toContain('genre_slug');
  });

  it('should cascade delete when audience is deleted', () => {
    const config = getTableConfig(audienceGenreSummaries);
    const audienceFK = config.foreignKeys.find((fk) => {
      const ref = fk.reference();
      return getTableConfig(ref.foreignTable).name === 'audiences';
    });
    expect(audienceFK?.onDelete).toBe('cascade');
  });

  it('should have the required indexes', () => {
    const indexNames = getIndexNames(audienceGenreSummaries);
    expect(indexNames).toContain('ags_audience_avg_interest_idx');
    expect(indexNames).toContain('ags_audience_id_idx');
  });
});

describe('creative_outputs table', () => {
  it('should have the correct table name', () => {
    expect(getTableConfig(creativeOutputs).name).toBe('creative_outputs');
  });

  it('should have all required columns', () => {
    const columns = getColumnNames(creativeOutputs);
    const expected = [
      'id',
      'user_id',
      'audience_id',
      'type',
      'content',
      'created_at',
      'updated_at',
    ];
    for (const col of expected) {
      expect(columns).toContain(col);
    }
  });

  it('should have id as UUID primary key', () => {
    const col = getColumn(creativeOutputs, 'id');
    expect(col?.primary).toBe(true);
    expect(col?.columnType).toBe('PgUUID');
  });

  it('should have user_id as UUID not null', () => {
    const col = getColumn(creativeOutputs, 'user_id');
    expect(col?.columnType).toBe('PgUUID');
    expect(col?.notNull).toBe(true);
  });

  it('should have foreign keys to audiences', () => {
    const fks = getForeignKeyTableReferences(creativeOutputs);
    const audienceFK = fks.find((fk) => fk.foreignTable === 'audiences');
    expect(audienceFK).toBeDefined();
    expect(audienceFK?.foreignColumns).toContain('id');
  });

  it('should cascade delete when audience is deleted', () => {
    const config = getTableConfig(creativeOutputs);
    const audienceFK = config.foreignKeys.find((fk) => {
      const ref = fk.reference();
      return getTableConfig(ref.foreignTable).name === 'audiences';
    });
    expect(audienceFK?.onDelete).toBe('cascade');
  });

  it('should have content as JSONB', () => {
    const col = getColumn(creativeOutputs, 'content');
    expect(col?.columnType).toBe('PgJsonb');
  });

  it('should have type as text not null', () => {
    const col = getColumn(creativeOutputs, 'type');
    expect(col?.dataType).toBe('string');
    expect(col?.notNull).toBe(true);
  });

  it('should have the required indexes', () => {
    const indexNames = getIndexNames(creativeOutputs);
    expect(indexNames).toContain('creative_outputs_user_id_idx');
    expect(indexNames).toContain('creative_outputs_audience_type_idx');
    expect(indexNames).toContain('creative_outputs_user_type_updated_idx');
  });
});

describe('type exports', () => {
  it('should export InferSelectModel types', () => {
    const assertRespondent: Respondent = {} as Respondent;
    const assertGenre: Genre = {} as Genre;
    const assertRGI: RespondentGenreInterest = {} as RespondentGenreInterest;
    const assertAudience: Audience = {} as Audience;
    const assertAGS: AudienceGenreSummary = {} as AudienceGenreSummary;
    const assertCreativeOutput: CreativeOutput = {} as CreativeOutput;

    expect(assertRespondent).toBeDefined();
    expect(assertGenre).toBeDefined();
    expect(assertRGI).toBeDefined();
    expect(assertAudience).toBeDefined();
    expect(assertAGS).toBeDefined();
    expect(assertCreativeOutput).toBeDefined();
  });

  it('should export InferInsertModel types', () => {
    const assertNewRespondent: NewRespondent = {} as NewRespondent;
    const assertNewGenre: NewGenre = {} as NewGenre;
    const assertNewRGI: NewRespondentGenreInterest =
      {} as NewRespondentGenreInterest;
    const assertNewAudience: NewAudience = {} as NewAudience;
    const assertNewAGS: NewAudienceGenreSummary =
      {} as NewAudienceGenreSummary;
    const assertNewCreativeOutput: NewCreativeOutput =
      {} as NewCreativeOutput;

    expect(assertNewRespondent).toBeDefined();
    expect(assertNewGenre).toBeDefined();
    expect(assertNewRGI).toBeDefined();
    expect(assertNewAudience).toBeDefined();
    expect(assertNewAGS).toBeDefined();
    expect(assertNewCreativeOutput).toBeDefined();
  });
});
