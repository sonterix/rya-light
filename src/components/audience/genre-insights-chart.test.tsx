import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

const mockUseAudienceInsights = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useAudienceInsights: (id: string | null) => mockUseAudienceInsights(id),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
  LabelList: () => null,
}));

import { GenreInsightsChart } from './genre-insights-chart';

const GENRES = [
  { genreSlug: 'RQ.2.34', genreName: 'Cooking / Baking', avgInterest: '1.3', pctHighlyInterested: '1.0', respondentCount: 10 },
  { genreSlug: 'RQ.2.38', genreName: 'Fantasy Sports', avgInterest: '1.8', pctHighlyInterested: '0.9', respondentCount: 10 },
  { genreSlug: 'RQ.2.57', genreName: 'Reality TV', avgInterest: '2.1', pctHighlyInterested: '0.7', respondentCount: 10 },
  { genreSlug: 'RQ.2.78', genreName: 'Yoga & Mindfulness', avgInterest: '2.4', pctHighlyInterested: '0.6', respondentCount: 10 },
  { genreSlug: 'RQ.2.97', genreName: 'Meditation', avgInterest: '2.7', pctHighlyInterested: '0.5', respondentCount: 10 },
  { genreSlug: 'RQ.2.125', genreName: 'Running', avgInterest: '3.0', pctHighlyInterested: '0.3', respondentCount: 10 },
  { genreSlug: 'RQ.2.162', genreName: 'Gaming', avgInterest: '3.5', pctHighlyInterested: '0.2', respondentCount: 10 },
];

describe('GenreInsightsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows prompt when no audience is selected', () => {
    render(<GenreInsightsChart audienceId={null} />);

    expect(screen.getByText(/select or create an audience/i)).toBeInTheDocument();
  });

  it('shows skeleton while loading', () => {
    mockUseAudienceInsights.mockReturnValue({ data: undefined, isLoading: true });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('renders bar chart when data is available', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES.slice(0, 3), isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows top 5 genres initially', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES, isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByText('Cooking / Baking')).toBeInTheDocument();
    expect(screen.getByText('Fantasy Sports')).toBeInTheDocument();
    expect(screen.getByText('Reality TV')).toBeInTheDocument();
    expect(screen.getByText('Yoga & Mindfulness')).toBeInTheDocument();
    expect(screen.getByText('Meditation')).toBeInTheDocument();
    expect(screen.queryByText('Running')).not.toBeInTheDocument();
  });

  it('shows Show more button when more than 5 genres exist', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES, isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
  });

  it('does not show Show more button when 5 or fewer genres', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES.slice(0, 5), isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
  });

  it('reveals all genres after clicking Show more', async () => {
    const user = userEvent.setup();
    mockUseAudienceInsights.mockReturnValue({ data: GENRES, isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    await user.click(screen.getByRole('button', { name: /show more/i }));

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Gaming')).toBeInTheDocument();
  });

  it('shows message when no insights data exists', () => {
    mockUseAudienceInsights.mockReturnValue({ data: [], isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByText(/no genre insights/i)).toBeInTheDocument();
  });

  it('displays avg interest score for each genre', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES.slice(0, 1), isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByText(/1\.3/)).toBeInTheDocument();
  });

  it('displays pct highly interested for each genre', () => {
    mockUseAudienceInsights.mockReturnValue({ data: GENRES.slice(0, 1), isLoading: false });

    render(<GenreInsightsChart audienceId="aud-1" />);

    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
