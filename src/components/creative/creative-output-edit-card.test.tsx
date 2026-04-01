import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import React from 'react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockDeleteOutput = vi.fn();
const mockPatchOutput = vi.fn();
vi.mock('@/hooks/use-creative', () => ({
  useDeleteCreativeOutput: vi.fn(() => ({
    mutate: mockDeleteOutput,
    isPending: false,
  })),
  usePatchCreativeOutput: vi.fn(() => ({
    mutate: mockPatchOutput,
    isPending: false,
  })),
}));

const mockGeneratePersona = vi.fn();
vi.mock('@/hooks/use-generate-persona', () => ({
  useGeneratePersona: vi.fn(() => ({
    generate: mockGeneratePersona,
    isGenerating: false,
    partialPersona: null,
    error: null,
  })),
}));
vi.mock('@/hooks/use-generate-campaign', () => ({
  useGenerateCampaign: vi.fn(() => ({
    generate: vi.fn(),
    isGenerating: false,
    partialCampaign: null,
    error: null,
  })),
}));
vi.mock('@/hooks/use-generate-messaging', () => ({
  useGenerateMessaging: vi.fn(() => ({
    generate: vi.fn(),
    isGenerating: false,
    partialMessaging: null,
    error: null,
  })),
}));
vi.mock('@/hooks/use-generate-opportunity', () => ({
  useGenerateOpportunity: vi.fn(() => ({
    generate: vi.fn(),
    isGenerating: false,
    partialOpportunity: null,
    error: null,
  })),
}));

import { CreativeOutputEditCard } from './creative-output-edit-card';

const TEST_PERSONA_OUTPUT = {
  id: 'out-1',
  userId: 'user-1',
  audienceId: 'aud-1',
  type: 'persona',
  content: {
    name: 'Alex',
    demographicSummary: 'Ages 25-34',
    topInterests: [],
    lifestyleDescription: 'Active lifestyle',
    howToReachThem: 'Social media',
  },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('CreativeOutputEditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteOutput.mockImplementation((_id: string, { onSuccess }: { onSuccess?: () => void }) => {
      onSuccess?.();
    });
    mockPatchOutput.mockImplementation((_args: unknown, { onSuccess }: { onSuccess?: () => void }) => {
      onSuccess?.();
    });
  });

  it('renders persona content', () => {
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText(/Alex/)).toBeInTheDocument();
  });

  it('shows Regenerate button', () => {
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('shows confirmation before regenerating', async () => {
    const user = userEvent.setup();
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    await user.click(screen.getByRole('button', { name: /regenerate/i }));

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls generate when confirm is clicked after Regenerate', async () => {
    const user = userEvent.setup();
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    await user.click(screen.getByRole('button', { name: /regenerate/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockGeneratePersona).toHaveBeenCalledWith('aud-1', 'out-1');
  });

  it('cancels regenerate confirmation when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    await user.click(screen.getByRole('button', { name: /regenerate/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockGeneratePersona).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('shows delete button and confirmation flow', async () => {
    const user = userEvent.setup();
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getAllByRole('button', { name: /confirm/i }).length).toBeGreaterThan(0);
  });

  it('renders editable text fields for persona type', () => {
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    // Persona name and description are shown as editable fields
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Ages 25-34')).toBeInTheDocument();
  });

  it('calls patchOutput when an inline field is edited', async () => {
    const user = userEvent.setup();
    render(
      <CreativeOutputEditCard output={TEST_PERSONA_OUTPUT} audienceId="aud-1" />,
      { wrapper: createWrapper() },
    );

    // Click the name field to edit
    await user.click(screen.getByText('Alex'));
    // The first textbox after clicking is the name input
    const inputs = screen.getAllByRole('textbox');
    const nameInput = inputs[0];
    await user.clear(nameInput);
    await user.type(nameInput, 'Jordan');
    await user.keyboard('{Enter}');

    expect(mockPatchOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'out-1',
        content: expect.objectContaining({ name: 'Jordan' }),
      }),
      expect.any(Object),
    );
  });
});
