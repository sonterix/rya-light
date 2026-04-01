import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseAudiences = vi.fn();
const mockUseCreateAudience = vi.fn();
const mockUseAudienceWithRespondents = vi.fn();
const mockUseAudienceStore = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useAudiences: () => mockUseAudiences(),
  useCreateAudience: () => mockUseCreateAudience(),
  useAudienceWithRespondents: (id: string | null) => mockUseAudienceWithRespondents(id),
}));

vi.mock('@/stores/audience-store', () => ({
  useAudienceStore: (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void }) => unknown) =>
    mockUseAudienceStore(selector),
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
  mockUseAudienceStore.mockImplementation(
    (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void }) => unknown) =>
      selector({ selectedAudienceId: null, setSelectedAudienceId: vi.fn() }),
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
});
