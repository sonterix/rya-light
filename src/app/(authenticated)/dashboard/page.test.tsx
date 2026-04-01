import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mockUseAudiences = vi.fn();
const mockUseCreateAudience = vi.fn();
const mockUseAudienceWithRespondents = vi.fn();
const mockUseRespondentsForPreview = vi.fn();
const mockUseAudienceStore = vi.fn();
const mockUseAudienceInsights = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useAudiences: () => mockUseAudiences(),
  useCreateAudience: () => mockUseCreateAudience(),
  useAudienceWithRespondents: (id: string | null) => mockUseAudienceWithRespondents(id),
  useRespondentsForPreview: () => mockUseRespondentsForPreview(),
  useDeleteAudience: () => ({ mutate: vi.fn() }),
  useUpdateAudience: () => ({ mutate: vi.fn() }),
  useAudienceInsights: (id: string | null) => mockUseAudienceInsights(id),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Cell: () => null,
  LabelList: () => null,
}));

vi.mock('@/stores/audience-store', () => ({
  useAudienceStore: (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void; clearSelectedAudienceId: () => void }) => unknown) =>
    mockUseAudienceStore(selector),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/filter-matching', () => ({
  applyFilters: vi.fn().mockReturnValue([]),
}));

import DashboardPage from './page';

const TEST_AUDIENCE = {
  id: 'aud-1',
  userId: 'user-123',
  name: 'My Audience',
  filters: null,
  manualIncludes: null,
  manualExcludes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function setupDefaults() {
  mockUseAudiences.mockReturnValue({ data: [], isLoading: false });
  mockUseCreateAudience.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseAudienceWithRespondents.mockReturnValue({ data: undefined, isLoading: false });
  mockUseRespondentsForPreview.mockReturnValue({ data: [], isLoading: false });
  mockUseAudienceInsights.mockReturnValue({ data: [], isLoading: false });
  mockUseAudienceStore.mockImplementation(
    (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void; clearSelectedAudienceId: () => void }) => unknown) =>
      selector({ selectedAudienceId: null, setSelectedAudienceId: vi.fn(), clearSelectedAudienceId: vi.fn() }),
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaults();
  });

  it('renders the page heading', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /audiences/i })).toBeInTheDocument();
  });

  it('renders the Create Audience button', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('button', { name: /create audience/i })).toBeInTheDocument();
  });

  it('shows empty state when no audiences', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/no audiences yet/i)).toBeInTheDocument();
  });

  it('renders audience cards when audiences exist', () => {
    mockUseAudiences.mockReturnValue({ data: [TEST_AUDIENCE], isLoading: false });
    mockUseAudienceWithRespondents.mockImplementation(() => ({
      data: { audience: TEST_AUDIENCE, respondents: [] },
      isLoading: false,
    }));

    render(<DashboardPage />);

    expect(screen.getByText('My Audience')).toBeInTheDocument();
  });

  it('opens creation sheet when Create Audience is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /create audience/i }));

    expect(screen.getByLabelText(/audience name/i)).toBeInTheDocument();
  });

  it('shows prompt to select or create audience when none selected', () => {
    render(<DashboardPage />);

    expect(screen.getByText(/select or create an audience/i)).toBeInTheDocument();
  });

  it('shows genre insights chart when audience is selected', () => {
    mockUseAudienceStore.mockImplementation(
      (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void; clearSelectedAudienceId: () => void }) => unknown) =>
        selector({ selectedAudienceId: 'aud-1', setSelectedAudienceId: vi.fn(), clearSelectedAudienceId: vi.fn() }),
    );
    mockUseAudienceInsights.mockReturnValue({
      data: [
        { genreSlug: 'RQ.2.34', genreName: 'Cooking / Baking', avgInterest: '1.3', pctHighlyInterested: '1.0', respondentCount: 5 },
      ],
      isLoading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText(/genre insights/i)).toBeInTheDocument();
  });
});
