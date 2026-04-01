import { applyFilters } from './filter-matching';
import type { AudienceFilters } from './filter-matching';
import type { Respondent } from '@/db/schema';

function makeRespondent(overrides: Partial<Respondent> = {}): Respondent {
  return {
    respondentId: 1,
    wave: 1,
    waveId: 1,
    weight: '1.0',
    audienceCategory: 'Wellness-Oriented Parents',
    age: 35,
    gender: 'Female',
    ethnicity: 'White',
    region: 'South',
    communityType: 'Suburban',
    maritalStatus: 'Married',
    householdSize: 3,
    education: "Bachelor's Degree",
    employmentStatus: 'Employed',
    householdIncomeUsd: 75000,
    investableAssetsUsd: 50000,
    zipCode: '12345',
    state: 'TX',
    dma: 'Austin',
    parentStatus: 'Parent',
    politicalAffiliation: 'Independent',
    homeOwnership: 'Own',
    ...overrides,
  };
}

const baseRespondent = makeRespondent();

describe('applyFilters', () => {
  describe('empty filters', () => {
    it('returns all respondents when filters is null', () => {
      const respondents = [makeRespondent({ respondentId: 1 }), makeRespondent({ respondentId: 2 })];
      const result = applyFilters({ filters: null, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });

    it('returns all respondents when filters is empty object', () => {
      const respondents = [makeRespondent({ respondentId: 1 }), makeRespondent({ respondentId: 2 })];
      const result = applyFilters({ filters: {}, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });
  });

  describe('categorical filters', () => {
    it('filters by gender matching accepted values', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
        makeRespondent({ respondentId: 2, gender: 'Male' }),
        makeRespondent({ respondentId: 3, gender: 'Non-binary' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });

    it('filters by multiple accepted values for categorical field', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
        makeRespondent({ respondentId: 2, gender: 'Male' }),
        makeRespondent({ respondentId: 3, gender: 'Non-binary' }),
      ];
      const filters: AudienceFilters = { gender: ['Female', 'Male'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });

    it('filters by audience_category', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, audienceCategory: 'Wellness-Oriented Parents' }),
        makeRespondent({ respondentId: 2, audienceCategory: 'Tech Enthusiasts' }),
      ];
      const filters: AudienceFilters = { audienceCategory: ['Wellness-Oriented Parents'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });

    it('filters by region', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, region: 'South' }),
        makeRespondent({ respondentId: 2, region: 'West' }),
        makeRespondent({ respondentId: 3, region: 'Northeast' }),
      ];
      const filters: AudienceFilters = { region: ['South', 'West'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no respondents match categorical filter', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Male'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(0);
    });
  });

  describe('numeric range filters', () => {
    it('filters by age with min only', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, age: 25 }),
        makeRespondent({ respondentId: 2, age: 30 }),
        makeRespondent({ respondentId: 3, age: 40 }),
      ];
      const filters: AudienceFilters = { age: { min: 30 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.respondentId)).toEqual([2, 3]);
    });

    it('filters by age with max only', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, age: 25 }),
        makeRespondent({ respondentId: 2, age: 30 }),
        makeRespondent({ respondentId: 3, age: 40 }),
      ];
      const filters: AudienceFilters = { age: { max: 30 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.respondentId)).toEqual([1, 2]);
    });

    it('filters by age with min and max (inclusive)', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, age: 25 }),
        makeRespondent({ respondentId: 2, age: 30 }),
        makeRespondent({ respondentId: 3, age: 40 }),
        makeRespondent({ respondentId: 4, age: 50 }),
      ];
      const filters: AudienceFilters = { age: { min: 30, max: 40 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.respondentId)).toEqual([2, 3]);
    });

    it('includes boundary values in range filter', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, age: 30 }),
        makeRespondent({ respondentId: 2, age: 40 }),
      ];
      const filters: AudienceFilters = { age: { min: 30, max: 40 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });

    it('filters by householdIncomeUsd range', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, householdIncomeUsd: 30000 }),
        makeRespondent({ respondentId: 2, householdIncomeUsd: 75000 }),
        makeRespondent({ respondentId: 3, householdIncomeUsd: 150000 }),
      ];
      const filters: AudienceFilters = { householdIncomeUsd: { min: 50000, max: 100000 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(2);
    });
  });

  describe('AND combination of multiple filters', () => {
    it('combines categorical and range filters with AND logic', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female', age: 30 }),
        makeRespondent({ respondentId: 2, gender: 'Male', age: 30 }),
        makeRespondent({ respondentId: 3, gender: 'Female', age: 50 }),
      ];
      const filters: AudienceFilters = { gender: ['Female'], age: { min: 25, max: 40 } };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });

    it('applies all categorical filters together', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female', region: 'South' }),
        makeRespondent({ respondentId: 2, gender: 'Female', region: 'West' }),
        makeRespondent({ respondentId: 3, gender: 'Male', region: 'South' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'], region: ['South'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });
  });

  describe('manual includes', () => {
    it('adds manual includes not already in filtered set', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
        makeRespondent({ respondentId: 2, gender: 'Male' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: [2], manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.respondentId).sort()).toEqual([1, 2]);
    });

    it('does not duplicate respondents already in filtered set', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: [1], manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
    });

    it('ignores manual includes for non-existent respondents', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: [999], manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
    });

    it('adds manual includes when filters is null', () => {
      const respondents = [
        makeRespondent({ respondentId: 1 }),
        makeRespondent({ respondentId: 2 }),
      ];
      const result = applyFilters({ filters: null, manualIncludes: [1, 2], manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });
  });

  describe('manual excludes', () => {
    it('removes excluded respondents from result', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
        makeRespondent({ respondentId: 2, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: [2], respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });

    it('excludes respondents that were manually included', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Male' }),
        makeRespondent({ respondentId: 2, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: [1], manualExcludes: [1], respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(2);
    });

    it('excludes respondents when filters is null', () => {
      const respondents = [
        makeRespondent({ respondentId: 1 }),
        makeRespondent({ respondentId: 2 }),
      ];
      const result = applyFilters({ filters: null, manualIncludes: null, manualExcludes: [1], respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(2);
    });
  });

  describe('combined manual includes and excludes', () => {
    it('applies includes then excludes in correct order', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, gender: 'Female' }),
        makeRespondent({ respondentId: 2, gender: 'Male' }),
        makeRespondent({ respondentId: 3, gender: 'Female' }),
      ];
      const filters: AudienceFilters = { gender: ['Female'] };
      const result = applyFilters({ filters, manualIncludes: [2], manualExcludes: [3], respondents });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.respondentId).sort()).toEqual([1, 2]);
    });
  });

  describe('edge cases', () => {
    it('handles empty respondents list', () => {
      const result = applyFilters({ filters: { gender: ['Female'] }, manualIncludes: null, manualExcludes: null, respondents: [] });
      expect(result).toHaveLength(0);
    });

    it('handles range filter with no min or max (matches all)', () => {
      const respondents = [
        makeRespondent({ respondentId: 1, age: 20 }),
        makeRespondent({ respondentId: 2, age: 80 }),
      ];
      const filters: AudienceFilters = { age: {} };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(2);
    });

    it('handles all advanced filters together', () => {
      const respondents = [
        makeRespondent({
          respondentId: 1,
          state: 'TX',
          communityType: 'Suburban',
          householdIncomeUsd: 75000,
          parentStatus: 'Parent',
          education: "Bachelor's Degree",
          employmentStatus: 'Employed',
          homeOwnership: 'Own',
        }),
        makeRespondent({
          respondentId: 2,
          state: 'CA',
          communityType: 'Urban',
          householdIncomeUsd: 120000,
          parentStatus: 'Non-Parent',
          education: "Master's Degree",
          employmentStatus: 'Self-Employed',
          homeOwnership: 'Rent',
        }),
      ];
      const filters: AudienceFilters = {
        state: ['TX'],
        communityType: ['Suburban'],
        householdIncomeUsd: { min: 50000, max: 100000 },
        parentStatus: ['Parent'],
        education: ["Bachelor's Degree"],
        employmentStatus: ['Employed'],
        homeOwnership: ['Own'],
      };
      const result = applyFilters({ filters, manualIncludes: null, manualExcludes: null, respondents });
      expect(result).toHaveLength(1);
      expect(result[0].respondentId).toBe(1);
    });
  });
});
