import { render, screen } from '@testing-library/react';

const mockUseRespondents = vi.fn();

vi.mock('@/hooks/use-respondents', () => ({
  useRespondents: (page: number) => mockUseRespondents(page),
  useRespondentDetail: vi.fn(),
}));

vi.mock('@/components/respondents/RespondentTable', () => ({
  RespondentTable: ({ respondents }: { respondents: unknown[] }) => (
    <div data-testid="respondent-table">Table with {respondents.length} rows</div>
  ),
}));

vi.mock('@/components/respondents/RespondentTableSkeleton', () => ({
  RespondentTableSkeleton: () => <div data-testid="table-skeleton">Loading...</div>,
}));

vi.mock('@/components/respondents/RespondentPagination', () => ({
  RespondentPagination: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalPages}
    </div>
  ),
}));

import { RespondentExplorer } from './RespondentExplorer';

describe('RespondentExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton while loading', () => {
    mockUseRespondents.mockReturnValue({ isLoading: true, isError: false, data: undefined });

    render(<RespondentExplorer page={1} />);

    expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('respondent-table')).not.toBeInTheDocument();
  });

  it('shows error message on failure', () => {
    mockUseRespondents.mockReturnValue({ isLoading: false, isError: true, data: undefined });

    render(<RespondentExplorer page={1} />);

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.queryByTestId('respondent-table')).not.toBeInTheDocument();
  });

  it('renders table with respondents on success', () => {
    mockUseRespondents.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: {
          respondents: [{ respondentId: 1 }, { respondentId: 2 }],
          pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
        },
      },
    });

    render(<RespondentExplorer page={1} />);

    expect(screen.getByTestId('respondent-table')).toBeInTheDocument();
    expect(screen.getByText('Table with 2 rows')).toBeInTheDocument();
  });

  it('renders pagination with correct props', () => {
    mockUseRespondents.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: {
          respondents: [],
          pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 },
        },
      },
    });

    render(<RespondentExplorer page={2} />);

    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 2 of 3');
  });

  it('calls useRespondents with the given page', () => {
    mockUseRespondents.mockReturnValue({ isLoading: true, isError: false, data: undefined });

    render(<RespondentExplorer page={3} />);

    expect(mockUseRespondents).toHaveBeenCalledWith(3);
  });
});
