import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockMutate = vi.fn();
const mockUseCreateAudience = vi.fn();
const mockUseAudienceWithRespondents = vi.fn();

vi.mock('@/hooks/use-audiences', () => ({
  useCreateAudience: () => mockUseCreateAudience(),
  useAudienceWithRespondents: () => mockUseAudienceWithRespondents(),
}));

vi.mock('@/lib/filter-matching', () => ({
  applyFilters: vi.fn().mockReturnValue([]),
}));

import { AudienceCreateSheet } from './audience-create-sheet';

function renderSheet(open = true) {
  return render(
    <AudienceCreateSheet open={open} onOpenChange={vi.fn()} onCreated={vi.fn()} />
  );
}

describe('AudienceCreateSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateAudience.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
    mockUseAudienceWithRespondents.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('renders the name input', () => {
    renderSheet();
    expect(screen.getByLabelText(/audience name/i)).toBeInTheDocument();
  });

  it('renders the Create button', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /create audience/i })).toBeInTheDocument();
  });

  it('renders the filter controls section', () => {
    renderSheet();
    expect(screen.getByText('Audience Category')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
  });

  it('disables Create button when name is empty', () => {
    renderSheet();
    expect(screen.getByRole('button', { name: /create audience/i })).toBeDisabled();
  });

  it('enables Create button when name is entered', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByLabelText(/audience name/i), 'My Audience');

    expect(screen.getByRole('button', { name: /create audience/i })).not.toBeDisabled();
  });

  it('calls mutate with name and filters on submit', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByLabelText(/audience name/i), 'Test Audience');
    await user.click(screen.getByRole('button', { name: /create audience/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Audience' }),
      expect.anything(),
    );
  });

  it('shows pending state while creating', () => {
    mockUseCreateAudience.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });
    renderSheet();

    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
  });

  it('shows respondent preview count', () => {
    renderSheet();
    expect(screen.getByText(/matching respondents/i)).toBeInTheDocument();
  });
});
