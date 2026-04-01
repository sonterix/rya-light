import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Respondent } from '@/db/schema';

import { ManualOverridesPanel } from './ManualOverridesPanel';

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

const FILTER_MATCHED = makeRespondent({ respondentId: 1, gender: 'Female' });
const NON_MATCHING = makeRespondent({ respondentId: 2, gender: 'Male' });
const ANOTHER_MATCHED = makeRespondent({ respondentId: 3, gender: 'Female' });

const DEFAULT_PROPS = {
  matchingRespondents: [FILTER_MATCHED, ANOTHER_MATCHED],
  allRespondents: [FILTER_MATCHED, NON_MATCHING, ANOTHER_MATCHED],
  manualIncludes: [] as number[],
  manualExcludes: [] as number[],
  onManualIncludesChange: vi.fn(),
  onManualExcludesChange: vi.fn(),
};

describe('ManualOverridesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('matching respondents list', () => {
    it('renders filter-matched respondents', () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      expect(screen.getByText('Respondent #1')).toBeInTheDocument();
      expect(screen.getByText('Respondent #3')).toBeInTheDocument();
    });

    it('shows Exclude button for each filter-matched respondent', () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      const excludeButtons = screen.getAllByRole('button', { name: /exclude/i });
      expect(excludeButtons).toHaveLength(2);
    });

    it('calls onManualExcludesChange when Exclude is clicked', async () => {
      const onManualExcludesChange = vi.fn();
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          onManualExcludesChange={onManualExcludesChange}
        />,
      );

      const excludeButtons = screen.getAllByRole('button', { name: /exclude/i });
      await userEvent.click(excludeButtons[0]);

      expect(onManualExcludesChange).toHaveBeenCalledWith([1]);
    });
  });

  describe('manually included respondents', () => {
    it('shows "Manually added" badge for manually included respondents in the matching list', () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          matchingRespondents={[FILTER_MATCHED, NON_MATCHING]}
          manualIncludes={[2]}
        />,
      );

      expect(screen.getByText('Manually added')).toBeInTheDocument();
    });

    it('does not show "Manually added" badge for filter-matched respondents', () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      expect(screen.queryByText('Manually added')).not.toBeInTheDocument();
    });

    it('renders an "Add respondent" section to include non-matching respondents', () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      expect(screen.getByRole('button', { name: /add respondent/i })).toBeInTheDocument();
    });

    it('calls onManualIncludesChange when a non-matching respondent is added', async () => {
      const onManualIncludesChange = vi.fn();
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          onManualIncludesChange={onManualIncludesChange}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /add respondent/i }));

      // A list of non-matching respondents should appear (respondent #2 does not match)
      const addButton = await screen.findByRole('button', { name: /add #2/i });
      await userEvent.click(addButton);

      expect(onManualIncludesChange).toHaveBeenCalledWith([2]);
    });
  });

  describe('excluded respondents', () => {
    it('does not show excluded count when no respondents are excluded', () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      expect(screen.queryByText(/excluded/i)).not.toBeInTheDocument();
    });

    it('shows clickable excluded count when respondents are excluded', () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1]}
          matchingRespondents={[ANOTHER_MATCHED]}
        />,
      );

      expect(screen.getByRole('button', { name: /1 excluded/i })).toBeInTheDocument();
    });

    it('shows correct count for multiple excluded respondents', () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1, 3]}
          matchingRespondents={[]}
        />,
      );

      expect(screen.getByRole('button', { name: /2 excluded/i })).toBeInTheDocument();
    });

    it('reveals excluded respondents panel on clicking the excluded count', async () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1]}
          matchingRespondents={[ANOTHER_MATCHED]}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /1 excluded/i }));

      expect(screen.getByText('Excluded Respondents')).toBeInTheDocument();
    });

    it('shows excluded respondent info in the revealed panel', async () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1]}
          matchingRespondents={[ANOTHER_MATCHED]}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /1 excluded/i }));

      expect(screen.getByText('Respondent #1')).toBeInTheDocument();
    });

    it('shows Re-include button in the excluded panel', async () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1]}
          matchingRespondents={[ANOTHER_MATCHED]}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /1 excluded/i }));

      expect(screen.getByRole('button', { name: /re-include/i })).toBeInTheDocument();
    });

    it('calls onManualExcludesChange with respondent removed when Re-include is clicked', async () => {
      const onManualExcludesChange = vi.fn();
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1, 3]}
          matchingRespondents={[]}
          onManualExcludesChange={onManualExcludesChange}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /2 excluded/i }));

      const reIncludeButtons = screen.getAllByRole('button', { name: /re-include/i });
      await userEvent.click(reIncludeButtons[0]);

      expect(onManualExcludesChange).toHaveBeenCalledWith([3]);
    });

    it('hides excluded panel when all respondents are re-included', async () => {
      const { rerender } = render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[1]}
          matchingRespondents={[ANOTHER_MATCHED]}
          onManualExcludesChange={vi.fn()}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /1 excluded/i }));
      expect(screen.getByText('Excluded Respondents')).toBeInTheDocument();

      // After re-including, re-render with empty excludes
      rerender(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          manualExcludes={[]}
          matchingRespondents={[FILTER_MATCHED, ANOTHER_MATCHED]}
          onManualExcludesChange={vi.fn()}
        />,
      );

      expect(screen.queryByText('Excluded Respondents')).not.toBeInTheDocument();
    });
  });

  describe('add respondent panel', () => {
    it('shows non-matching respondents (not in matching list and not excluded) in the add panel', async () => {
      render(
        <ManualOverridesPanel
          {...DEFAULT_PROPS}
          matchingRespondents={[FILTER_MATCHED]}
          allRespondents={[FILTER_MATCHED, NON_MATCHING, ANOTHER_MATCHED]}
          manualIncludes={[]}
          manualExcludes={[]}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /add respondent/i }));

      // NON_MATCHING (#2) and ANOTHER_MATCHED (#3) are not in matchingRespondents
      expect(screen.getByRole('button', { name: /add #2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add #3/i })).toBeInTheDocument();
    });

    it('does not show respondents already in the matching list in the add panel', async () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      await userEvent.click(screen.getByRole('button', { name: /add respondent/i }));

      // FILTER_MATCHED (#1) and ANOTHER_MATCHED (#3) are already in matchingRespondents
      expect(screen.queryByRole('button', { name: /add #1/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add #3/i })).not.toBeInTheDocument();
    });

    it('closes the add panel when clicking Add Respondent again', async () => {
      render(<ManualOverridesPanel {...DEFAULT_PROPS} />);

      const toggleButton = screen.getByRole('button', { name: /add respondent/i });
      await userEvent.click(toggleButton);

      expect(screen.getByRole('button', { name: /add #2/i })).toBeInTheDocument();

      await userEvent.click(toggleButton);

      expect(screen.queryByRole('button', { name: /add #2/i })).not.toBeInTheDocument();
    });
  });
});
