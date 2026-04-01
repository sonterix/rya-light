import { act, render, screen } from '@testing-library/react';

const mockUseAudienceWithRespondents = vi.fn();
const mockUpdateMutate = vi.fn();
const mockUseAudienceStore = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useAudienceWithRespondents: (id: string | null) => mockUseAudienceWithRespondents(id),
  useUpdateAudience: () => ({ mutate: mockUpdateMutate }),
}));

vi.mock('@/stores/audience-store', () => ({
  useAudienceStore: (selector: (state: { selectedAudienceId: string | null; clearSelectedAudienceId: () => void }) => unknown) =>
    mockUseAudienceStore(selector),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

import { AudienceEditSheet } from './audience-edit-sheet';

const TEST_AUDIENCE = {
  id: 'aud-1',
  userId: 'user-123',
  name: 'My Audience',
  filters: { gender: ['Female'] },
  manualIncludes: null,
  manualExcludes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const TEST_RESPONDENT = {
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
};

function setupStore(selectedId: string | null = null) {
  const clearSelectedAudienceId = vi.fn();
  mockUseAudienceStore.mockImplementation(
    (selector: (state: { selectedAudienceId: string | null; clearSelectedAudienceId: () => void }) => unknown) =>
      selector({ selectedAudienceId: selectedId, clearSelectedAudienceId }),
  );
  return { clearSelectedAudienceId };
}

describe('AudienceEditSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render form content when no audience is selected', () => {
    setupStore(null);

    render(<AudienceEditSheet />);

    expect(screen.queryByLabelText('Audience Name')).not.toBeInTheDocument();
  });

  it('renders the edit form when an audience is selected', () => {
    setupStore('aud-1');
    mockUseAudienceWithRespondents.mockReturnValue({
      data: { audience: TEST_AUDIENCE, respondents: [TEST_RESPONDENT] },
      isLoading: false,
    });

    render(<AudienceEditSheet />);

    expect(screen.getByLabelText('Audience Name')).toBeInTheDocument();
  });

  it('populates name input with the existing audience name', () => {
    setupStore('aud-1');
    mockUseAudienceWithRespondents.mockReturnValue({
      data: { audience: TEST_AUDIENCE, respondents: [TEST_RESPONDENT] },
      isLoading: false,
    });

    render(<AudienceEditSheet />);

    expect(screen.getByLabelText('Audience Name')).toHaveValue('My Audience');
  });

  it('shows matching respondent count', () => {
    setupStore('aud-1');
    mockUseAudienceWithRespondents.mockReturnValue({
      data: { audience: TEST_AUDIENCE, respondents: [TEST_RESPONDENT] },
      isLoading: false,
    });

    render(<AudienceEditSheet />);

    expect(screen.getByText(/matching respondents/i)).toBeInTheDocument();
  });

  it('triggers auto-save after debounce when name changes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setupStore('aud-1');
    mockUseAudienceWithRespondents.mockReturnValue({
      data: { audience: TEST_AUDIENCE, respondents: [TEST_RESPONDENT] },
      isLoading: false,
    });

    render(<AudienceEditSheet />);

    const input = screen.getByLabelText('Audience Name');
    expect(input).toHaveValue('My Audience');

    act(() => {
      input.focus();
    });

    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(input, 'Updated Name');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(mockUpdateMutate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'aud-1', name: 'Updated Name' }),
      expect.any(Object),
    );

    vi.useRealTimers();
  });

  it('shows zero-match warning when no respondents match', () => {
    setupStore('aud-1');
    mockUseAudienceWithRespondents.mockReturnValue({
      data: {
        audience: { ...TEST_AUDIENCE, filters: { gender: ['Non-binary'] } },
        respondents: [TEST_RESPONDENT],
      },
      isLoading: false,
    });

    render(<AudienceEditSheet />);

    expect(screen.getByText(/no respondents match/i)).toBeInTheDocument();
  });
});
