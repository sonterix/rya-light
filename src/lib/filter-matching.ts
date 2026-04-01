import type { Respondent } from '@/db/schema';

export interface NumericRangeFilter {
  min?: number;
  max?: number;
}

export type CategoricalFilter = string[];

export interface AudienceFilters {
  audienceCategory?: CategoricalFilter;
  gender?: CategoricalFilter;
  region?: CategoricalFilter;
  state?: CategoricalFilter;
  communityType?: CategoricalFilter;
  parentStatus?: CategoricalFilter;
  education?: CategoricalFilter;
  employmentStatus?: CategoricalFilter;
  homeOwnership?: CategoricalFilter;
  age?: NumericRangeFilter;
  householdIncomeUsd?: NumericRangeFilter;
}

interface ApplyFiltersParams {
  filters: AudienceFilters | null | unknown;
  manualIncludes: number[] | null;
  manualExcludes: number[] | null;
  respondents: Respondent[];
}

const CATEGORICAL_FIELDS: (keyof AudienceFilters)[] = [
  'audienceCategory',
  'gender',
  'region',
  'state',
  'communityType',
  'parentStatus',
  'education',
  'employmentStatus',
  'homeOwnership',
];

const RANGE_FIELDS: (keyof AudienceFilters)[] = ['age', 'householdIncomeUsd'];

function isCategoricalFilter(value: unknown): value is CategoricalFilter {
  return Array.isArray(value);
}

function isNumericRangeFilter(value: unknown): value is NumericRangeFilter {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAudienceFilters(value: unknown): value is AudienceFilters {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRespondentFieldValue(
  respondent: Respondent,
  field: keyof AudienceFilters,
): string | number {
  switch (field) {
    case 'audienceCategory':
      return respondent.audienceCategory;
    case 'gender':
      return respondent.gender;
    case 'region':
      return respondent.region;
    case 'state':
      return respondent.state;
    case 'communityType':
      return respondent.communityType;
    case 'parentStatus':
      return respondent.parentStatus;
    case 'education':
      return respondent.education;
    case 'employmentStatus':
      return respondent.employmentStatus;
    case 'homeOwnership':
      return respondent.homeOwnership;
    case 'age':
      return respondent.age;
    case 'householdIncomeUsd':
      return respondent.householdIncomeUsd;
  }
}

function matchesFilters(
  respondent: Respondent,
  filters: AudienceFilters,
): boolean {
  for (const field of CATEGORICAL_FIELDS) {
    const filterValue = filters[field];
    if (filterValue === undefined) continue;
    if (!isCategoricalFilter(filterValue)) continue;

    const respondentValue = getRespondentFieldValue(respondent, field);
    if (!filterValue.includes(String(respondentValue))) {
      return false;
    }
  }

  for (const field of RANGE_FIELDS) {
    const filterValue = filters[field];
    if (filterValue === undefined) continue;
    if (!isNumericRangeFilter(filterValue)) continue;

    const respondentValue = Number(getRespondentFieldValue(respondent, field));
    const { min, max } = filterValue;

    if (min !== undefined && respondentValue < min) return false;
    if (max !== undefined && respondentValue > max) return false;
  }

  return true;
}

export function applyFilters({
  filters,
  manualIncludes,
  manualExcludes,
  respondents,
}: ApplyFiltersParams): Respondent[] {
  const parsedFilters = isAudienceFilters(filters) ? filters : null;

  const filteredSet = new Map<number, Respondent>();

  for (const respondent of respondents) {
    if (!parsedFilters || matchesFilters(respondent, parsedFilters)) {
      filteredSet.set(respondent.respondentId, respondent);
    }
  }

  if (manualIncludes && manualIncludes.length > 0) {
    const respondentById = new Map<number, Respondent>(
      respondents.map((r) => [r.respondentId, r]),
    );
    for (const id of manualIncludes) {
      if (!filteredSet.has(id)) {
        const respondent = respondentById.get(id);
        if (respondent) {
          filteredSet.set(id, respondent);
        }
      }
    }
  }

  if (manualExcludes && manualExcludes.length > 0) {
    for (const id of manualExcludes) {
      filteredSet.delete(id);
    }
  }

  return Array.from(filteredSet.values());
}
