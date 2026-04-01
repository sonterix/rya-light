import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { CreativeContent } from '@/types/creative';

const mockRefine = vi.fn();
const defaultRefineState = {
  refine: mockRefine,
  isRefining: false,
  partialContent: null as CreativeContent | null,
  error: null as string | null,
};
const mockUseRefineCreative = vi.fn(
  (_outputId: string, _type: 'persona' | 'campaign' | 'messaging' | 'opportunity') =>
    defaultRefineState,
);
vi.mock('@/hooks/use-refine-creative', () => ({
  useRefineCreative: (outputId: string, type: 'persona' | 'campaign' | 'messaging' | 'opportunity') =>
    mockUseRefineCreative(outputId, type),
}));

import { RefinementPanel } from './RefinementPanel';

const TEST_CONTENT: CreativeContent = {
  name: 'Alex',
  demographicSummary: 'test',
  topInterests: [],
  lifestyleDescription: 'Active lifestyle',
  howToReachThem: 'Social media',
};

describe('RefinementPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefine.mockResolvedValue(undefined);
  });

  it('renders preset buttons for persona type', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="persona"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByText('Add more detail')).toBeInTheDocument();
    expect(screen.getByText('Make it shorter')).toBeInTheDocument();
    expect(screen.getByText('Focus on lifestyle habits')).toBeInTheDocument();
    expect(screen.getByText('Focus on media consumption')).toBeInTheDocument();
    expect(screen.getByText('Emphasize demographics')).toBeInTheDocument();
  });

  it('renders preset buttons for campaign type', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="campaign"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByText('Make it bolder')).toBeInTheDocument();
    expect(screen.getByText('Make it safer')).toBeInTheDocument();
    expect(screen.getByText('Target different format')).toBeInTheDocument();
  });

  it('renders preset buttons for messaging type', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="messaging"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByText('Make it more emotional')).toBeInTheDocument();
    expect(screen.getByText('Make it more data-driven')).toBeInTheDocument();
  });

  it('renders preset buttons for opportunity type', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="opportunity"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByText('Explore deeper')).toBeInTheDocument();
    expect(screen.getByText('Suggest more crossover ideas')).toBeInTheDocument();
  });

  it('calls refine with preset instruction when preset button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="persona"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Make it shorter'));

    expect(mockRefine).toHaveBeenCalledWith(
      TEST_CONTENT,
      'Make it shorter',
      'aud-1',
      expect.any(Function),
    );
  });

  it('renders freeform input field', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="persona"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(/custom refinement/i)).toBeInTheDocument();
  });

  it('submits freeform prompt on Enter', async () => {
    const user = userEvent.setup();
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="persona"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(/custom refinement/i);
    await user.type(input, 'Make it focus on sports');
    await user.keyboard('{Enter}');

    expect(mockRefine).toHaveBeenCalledWith(
      TEST_CONTENT,
      'Make it focus on sports',
      'aud-1',
      expect.any(Function),
    );
  });

  it('renders genre dropdown for campaign Focus on [genre] preset', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="campaign"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
        genres={['Action', 'Comedy', 'Drama']}
      />,
    );

    expect(screen.getByRole('combobox', { name: /genre/i })).toBeInTheDocument();
  });

  it('renders trait dropdown for messaging Shift hook to [trait] preset', () => {
    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="messaging"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
        traits={['Adventurous', 'Budget-conscious']}
      />,
    );

    expect(screen.getByRole('combobox', { name: /trait/i })).toBeInTheDocument();
  });

  it('shows error message when refinement fails', () => {
    mockUseRefineCreative.mockReturnValueOnce({
      refine: mockRefine,
      isRefining: false,
      partialContent: null,
      error: 'AI service unavailable',
    });

    render(
      <RefinementPanel
        outputId="out-1"
        audienceId="aud-1"
        type="persona"
        content={TEST_CONTENT}
        onRefined={vi.fn()}
      />,
    );

    expect(screen.getByText('AI service unavailable')).toBeInTheDocument();
  });
});
