import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockRespondentDetailPanel = vi.fn((_props: { respondentId: number }) => null);

vi.mock('@/components/respondents/respondent-detail-panel', () => ({
  RespondentDetailPanel: (props: { respondentId: number }) => {
    mockRespondentDetailPanel(props);
    return <div data-testid={`detail-panel-${props.respondentId}`}>Detail Panel</div>;
  },
}));

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

import { RespondentTable } from './respondent-table';

const mockRespondents = [
  {
    respondentId: 1,
    audienceCategory: 'Mainstream Sports Fan',
    age: 35,
    gender: 'Male',
    region: 'West',
    state: 'CA',
    householdIncomeUsd: 118000,
  },
  {
    respondentId: 2,
    audienceCategory: 'Casual Viewer',
    age: 28,
    gender: 'Female',
    region: 'Northeast',
    state: 'NY',
    householdIncomeUsd: 75000,
  },
];

describe('RespondentTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 6 column headers', () => {
    render(<RespondentTable respondents={mockRespondents} />);

    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Audience Category' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Gender' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Household Income' })).toBeInTheDocument();
  });

  it('renders respondent rows', () => {
    render(<RespondentTable respondents={mockRespondents} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Mainstream Sports Fan')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('West, CA')).toBeInTheDocument();
    expect(screen.getByText('$118,000')).toBeInTheDocument();
  });

  it('formats household income as currency', () => {
    render(<RespondentTable respondents={mockRespondents} />);

    expect(screen.getByText('$118,000')).toBeInTheDocument();
    expect(screen.getByText('$75,000')).toBeInTheDocument();
  });

  it('combines region and state for location', () => {
    render(<RespondentTable respondents={mockRespondents} />);

    expect(screen.getByText('West, CA')).toBeInTheDocument();
    expect(screen.getByText('Northeast, NY')).toBeInTheDocument();
  });

  it('shows empty state when no respondents', () => {
    render(<RespondentTable respondents={[]} />);

    expect(screen.getByText('No respondents found.')).toBeInTheDocument();
  });

  it('does not show detail panel by default', () => {
    render(<RespondentTable respondents={mockRespondents} />);

    expect(screen.queryByTestId('detail-panel-1')).not.toBeInTheDocument();
  });

  it('expands detail panel when row is clicked', async () => {
    const user = userEvent.setup();
    render(<RespondentTable respondents={mockRespondents} />);

    const rows = screen.getAllByRole('row');
    await user.click(rows[1]);

    expect(screen.getByTestId('detail-panel-1')).toBeInTheDocument();
  });

  it('collapses detail panel when same row is clicked again', async () => {
    const user = userEvent.setup();
    render(<RespondentTable respondents={mockRespondents} />);

    const rows = screen.getAllByRole('row');
    await user.click(rows[1]);
    expect(screen.getByTestId('detail-panel-1')).toBeInTheDocument();

    await user.click(rows[1]);
    expect(screen.queryByTestId('detail-panel-1')).not.toBeInTheDocument();
  });

  it('only expands one row at a time', async () => {
    const user = userEvent.setup();
    render(<RespondentTable respondents={mockRespondents} />);

    const rows = screen.getAllByRole('row');
    await user.click(rows[1]);
    expect(screen.getByTestId('detail-panel-1')).toBeInTheDocument();

    await user.click(rows[2]);
    expect(screen.queryByTestId('detail-panel-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('detail-panel-2')).toBeInTheDocument();
  });
});
