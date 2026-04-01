'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AudienceFilters } from '@/lib/filter-matching';

const AUDIENCE_CATEGORIES = [
  'Affluent Culture Seekers',
  'Competitive Sports Fans',
  'Emerging Tech Professionals',
  'Wellness-Oriented Parents',
];

const GENDERS = ['Female', 'Male', 'Non-Binary'];

const REGIONS = ['Northeast', 'South', 'Midwest', 'West'];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const COMMUNITY_TYPES = ['Urban', 'Suburban'];

const PARENT_STATUSES = ['Parent', 'Not the parent'];

const EDUCATIONS = [
  'High school graduate',
  'Some college',
  'Completed 4-year college',
  'Post-graduate degree',
];

const EMPLOYMENT_STATUSES = [
  'Work full-time',
  'Work part-time',
  'Retired',
];

const HOME_OWNERSHIPS = ['Own a house', 'Own a condo or a coop', 'Rent an apartment'];

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  function toggleOption(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface-container-lowest p-3">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`rounded-md border px-2 py-1 text-xs transition-colors ${
                selected.includes(option)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface-container-low text-foreground hover:bg-muted'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RangeInputProps {
  label: string;
  minValue: number | undefined;
  maxValue: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

function RangeInput({ label, minValue, maxValue, onMinChange, onMaxChange }: RangeInputProps) {
  function parseValue(raw: string): number | undefined {
    const trimmed = raw.trim();
    if (trimmed === '') return undefined;
    const parsed = parseInt(trimmed, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  return (
    <div className="rounded-lg border border-border bg-surface-container-lowest p-3">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor={`${label}-min`} className="text-xs text-muted-foreground">
              {label} min
            </Label>
            <Input
              id={`${label}-min`}
              type="number"
              placeholder="Min"
              value={minValue ?? ''}
              onChange={(e) => onMinChange(parseValue(e.target.value))}
            />
          </div>
          <span className="mt-5 text-muted-foreground">–</span>
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor={`${label}-max`} className="text-xs text-muted-foreground">
              {label} max
            </Label>
            <Input
              id={`${label}-max`}
              type="number"
              placeholder="Max"
              value={maxValue ?? ''}
              onChange={(e) => onMaxChange(parseValue(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  filters: AudienceFilters;
  onChange: (filters: AudienceFilters) => void;
}

export function FilterControls({ filters, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function updateCategorical(field: keyof AudienceFilters, values: string[]) {
    onChange({
      ...filters,
      [field]: values.length > 0 ? values : undefined,
    });
  }

  function updateRangeMin(field: keyof AudienceFilters, value: number | undefined) {
    const existing = filters[field];
    const currentRange = typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
    onChange({
      ...filters,
      [field]: { ...currentRange, min: value },
    });
  }

  function updateRangeMax(field: keyof AudienceFilters, value: number | undefined) {
    const existing = filters[field];
    const currentRange = typeof existing === 'object' && !Array.isArray(existing) ? existing : {};
    onChange({
      ...filters,
      [field]: { ...currentRange, max: value },
    });
  }

  const audienceCategoryValues = Array.isArray(filters.audienceCategory) ? filters.audienceCategory : [];
  const genderValues = Array.isArray(filters.gender) ? filters.gender : [];
  const regionValues = Array.isArray(filters.region) ? filters.region : [];
  const ageRange = typeof filters.age === 'object' && !Array.isArray(filters.age) ? filters.age : {};
  const stateValues = Array.isArray(filters.state) ? filters.state : [];
  const communityTypeValues = Array.isArray(filters.communityType) ? filters.communityType : [];
  const incomeRange = typeof filters.householdIncomeUsd === 'object' && !Array.isArray(filters.householdIncomeUsd) ? filters.householdIncomeUsd : {};
  const parentStatusValues = Array.isArray(filters.parentStatus) ? filters.parentStatus : [];
  const educationValues = Array.isArray(filters.education) ? filters.education : [];
  const employmentStatusValues = Array.isArray(filters.employmentStatus) ? filters.employmentStatus : [];
  const homeOwnershipValues = Array.isArray(filters.homeOwnership) ? filters.homeOwnership : [];

  return (
    <div className="flex flex-col gap-5">
      <MultiSelect
        label="Audience Category"
        options={AUDIENCE_CATEGORIES}
        selected={audienceCategoryValues}
        onChange={(values) => updateCategorical('audienceCategory', values)}
      />

      <RangeInput
        label="Age"
        minValue={ageRange.min}
        maxValue={ageRange.max}
        onMinChange={(value) => updateRangeMin('age', value)}
        onMaxChange={(value) => updateRangeMax('age', value)}
      />

      <MultiSelect
        label="Gender"
        options={GENDERS}
        selected={genderValues}
        onChange={(values) => updateCategorical('gender', values)}
      />

      <MultiSelect
        label="Region"
        options={REGIONS}
        selected={regionValues}
        onChange={(values) => updateCategorical('region', values)}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="w-fit gap-1.5"
      >
        {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        Advanced Filters
      </Button>

      {showAdvanced && (
        <div className="flex flex-col gap-5 border-t pt-4">
          <MultiSelect
            label="State"
            options={STATES}
            selected={stateValues}
            onChange={(values) => updateCategorical('state', values)}
          />

          <MultiSelect
            label="Community Type"
            options={COMMUNITY_TYPES}
            selected={communityTypeValues}
            onChange={(values) => updateCategorical('communityType', values)}
          />

          <RangeInput
            label="Household Income"
            minValue={incomeRange.min}
            maxValue={incomeRange.max}
            onMinChange={(value) => updateRangeMin('householdIncomeUsd', value)}
            onMaxChange={(value) => updateRangeMax('householdIncomeUsd', value)}
          />

          <MultiSelect
            label="Parent Status"
            options={PARENT_STATUSES}
            selected={parentStatusValues}
            onChange={(values) => updateCategorical('parentStatus', values)}
          />

          <MultiSelect
            label="Education"
            options={EDUCATIONS}
            selected={educationValues}
            onChange={(values) => updateCategorical('education', values)}
          />

          <MultiSelect
            label="Employment Status"
            options={EMPLOYMENT_STATUSES}
            selected={employmentStatusValues}
            onChange={(values) => updateCategorical('employmentStatus', values)}
          />

          <MultiSelect
            label="Home Ownership"
            options={HOME_OWNERSHIPS}
            selected={homeOwnershipValues}
            onChange={(values) => updateCategorical('homeOwnership', values)}
          />
        </div>
      )}
    </div>
  );
}
