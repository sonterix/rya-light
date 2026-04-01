import { render, screen } from '@testing-library/react';

const mockUseRespondentDetail = vi.fn();

vi.mock('@/hooks/use-respondents', () => ({
  useRespondentDetail: (id: number) => mockUseRespondentDetail(id),
}));

import { RespondentDetailPanel } from './RespondentDetailPanel';

const mockDetailData = {
  data: {
    respondent: {
      respondentId: 1,
      wave: 1,
      waveId: 101,
      weight: '1.2',
      audienceCategory: 'Mainstream Sports Fan',
      age: 35,
      gender: 'Male',
      ethnicity: 'White',
      region: 'West',
      communityType: 'Suburban',
      maritalStatus: 'Married',
      householdSize: 3,
      education: "Bachelor's Degree",
      employmentStatus: 'Employed full-time',
      householdIncomeUsd: 118000,
      investableAssetsUsd: 50000,
      zipCode: '90210',
      state: 'CA',
      dma: 'Los Angeles',
      parentStatus: 'Not a parent',
      politicalAffiliation: 'Independent',
      homeOwnership: 'Own',
    },
    genreInterests: [
      { genreSlug: 'action', genreName: 'Action', interestLevel: 5 },
      { genreSlug: 'comedy', genreName: 'Comedy', interestLevel: 3 },
    ],
  },
};

describe('RespondentDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockUseRespondentDetail.mockReturnValue({ isLoading: true, isError: false, data: undefined });

    const { container } = render(<RespondentDetailPanel respondentId={1} />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error message on failure', () => {
    mockUseRespondentDetail.mockReturnValue({ isLoading: false, isError: true, data: undefined });

    render(<RespondentDetailPanel respondentId={1} />);

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders demographic details group', () => {
    mockUseRespondentDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockDetailData,
    });

    render(<RespondentDetailPanel respondentId={1} />);

    expect(screen.getByText('Demographic Details')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Married')).toBeInTheDocument();
  });

  it('renders genre interests', () => {
    mockUseRespondentDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockDetailData,
    });

    render(<RespondentDetailPanel respondentId={1} />);

    expect(screen.getByText('Genre Interests')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Comedy')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('does not render genre interests section when list is empty', () => {
    mockUseRespondentDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockDetailData,
        data: { ...mockDetailData.data, genreInterests: [] },
      },
    });

    render(<RespondentDetailPanel respondentId={1} />);

    expect(screen.queryByText('Genre Interests')).not.toBeInTheDocument();
  });

  it('calls useRespondentDetail with the respondent id', () => {
    mockUseRespondentDetail.mockReturnValue({ isLoading: true, isError: false, data: undefined });

    render(<RespondentDetailPanel respondentId={42} />);

    expect(mockUseRespondentDetail).toHaveBeenCalledWith(42);
  });
});
