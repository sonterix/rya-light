import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseAudiences = vi.fn();
const mockUseAudienceWithRespondents = vi.fn();
const mockUseAudienceStore = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useAudiences: () => mockUseAudiences(),
  useAudienceWithRespondents: (id: string | null) => mockUseAudienceWithRespondents(id),
}));

vi.mock('@/stores/audience-store', () => ({
  useAudienceStore: (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void }) => unknown) =>
    mockUseAudienceStore(selector),
}));

import { AudienceGrid } from './audience-grid';

const TEST_AUDIENCE_1 = {
  id: 'aud-1',
  userId: 'user-123',
  name: 'First Audience',
  filters: null,
  manualIncludes: null,
  manualExcludes: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const TEST_AUDIENCE_2 = {
  id: 'aud-2',
  userId: 'user-123',
  name: 'Second Audience',
  filters: null,
  manualIncludes: null,
  manualExcludes: null,
  createdAt: new Date('2026-01-02'),
  updatedAt: new Date('2026-01-02'),
};

function setupStore(selectedId: string | null = null) {
  const setSelectedAudienceId = vi.fn();
  mockUseAudienceStore.mockImplementation(
    (selector: (state: { selectedAudienceId: string | null; setSelectedAudienceId: (id: string) => void }) => unknown) =>
      selector({ selectedAudienceId: selectedId, setSelectedAudienceId }),
  );
  return { setSelectedAudienceId };
}

describe('AudienceGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAudienceWithRespondents.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('shows skeletons while loading', () => {
    mockUseAudiences.mockReturnValue({ data: undefined, isLoading: true });
    setupStore();

    render(<AudienceGrid />);

    expect(screen.getAllByRole('status')).toBeDefined();
  });

  it('renders audience cards when loaded', () => {
    mockUseAudiences.mockReturnValue({
      data: [TEST_AUDIENCE_1, TEST_AUDIENCE_2],
      isLoading: false,
    });
    mockUseAudienceWithRespondents.mockImplementation((id: string | null) => ({
      data: {
        audience: id === 'aud-1' ? TEST_AUDIENCE_1 : TEST_AUDIENCE_2,
        respondents: [],
      },
      isLoading: false,
    }));
    setupStore();

    render(<AudienceGrid />);

    expect(screen.getByText('First Audience')).toBeInTheDocument();
    expect(screen.getByText('Second Audience')).toBeInTheDocument();
  });

  it('shows empty state when no audiences exist', () => {
    mockUseAudiences.mockReturnValue({ data: [], isLoading: false });
    setupStore();

    render(<AudienceGrid />);

    expect(screen.getByText(/no audiences yet/i)).toBeInTheDocument();
  });

  it('calls setSelectedAudienceId when a card is clicked', async () => {
    const user = userEvent.setup();
    mockUseAudiences.mockReturnValue({
      data: [TEST_AUDIENCE_1],
      isLoading: false,
    });
    mockUseAudienceWithRespondents.mockImplementation(() => ({
      data: { audience: TEST_AUDIENCE_1, respondents: [] },
      isLoading: false,
    }));
    const { setSelectedAudienceId } = setupStore();

    render(<AudienceGrid />);

    await user.click(screen.getByRole('button'));

    expect(setSelectedAudienceId).toHaveBeenCalledWith('aud-1');
  });

  it('marks the selected audience card as active', () => {
    mockUseAudiences.mockReturnValue({
      data: [TEST_AUDIENCE_1, TEST_AUDIENCE_2],
      isLoading: false,
    });
    mockUseAudienceWithRespondents.mockImplementation((id: string | null) => ({
      data: {
        audience: id === 'aud-1' ? TEST_AUDIENCE_1 : TEST_AUDIENCE_2,
        respondents: [],
      },
      isLoading: false,
    }));
    setupStore('aud-1');

    render(<AudienceGrid />);

    const buttons = screen.getAllByRole('button');
    const firstButton = buttons.find((b) => b.textContent?.includes('First Audience'));
    const secondButton = buttons.find((b) => b.textContent?.includes('Second Audience'));

    expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    expect(secondButton).toHaveAttribute('aria-pressed', 'false');
  });
});
