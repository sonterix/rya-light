import { render, screen } from '@testing-library/react';

import type { PersonaSchema } from '@/lib/schemas/persona-schema';

import { PersonaCard } from './PersonaCard';

const FULL_PERSONA: PersonaSchema = {
  name: 'Alex Chen',
  demographicSummary: '25-34, urban, $80k income, 60% female',
  topInterests: [
    { genreName: 'Pop', interestLevel: 5 },
    { genreName: 'Hip-Hop', interestLevel: 4 },
    { genreName: 'Electronic', interestLevel: 3 },
  ],
  lifestyleDescription: 'Active lifestyle with heavy social media use and streaming subscriptions.',
  howToReachThem: 'Target via Instagram and Spotify playlist placements.',
};

describe('PersonaCard', () => {
  it('renders persona name as title', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
  });

  it('renders demographic summary', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(screen.getByText('25-34, urban, $80k income, 60% female')).toBeInTheDocument();
  });

  it('renders top interests as badges', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
    expect(screen.getByText('Electronic')).toBeInTheDocument();
  });

  it('renders lifestyle description', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(
      screen.getByText('Active lifestyle with heavy social media use and streaming subscriptions.'),
    ).toBeInTheDocument();
  });

  it('renders how to reach them section', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(
      screen.getByText('Target via Instagram and Spotify playlist placements.'),
    ).toBeInTheDocument();
  });

  it('renders with partial data (only name defined)', () => {
    const partial: Partial<PersonaSchema> = { name: 'Alex Chen' };
    render(<PersonaCard persona={partial} />);
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
  });

  it('renders loading skeleton when no persona provided', () => {
    render(<PersonaCard persona={null} isGenerating />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders interests section label', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(screen.getByText('Top Interests')).toBeInTheDocument();
  });

  it('renders how to reach them section label', () => {
    render(<PersonaCard persona={FULL_PERSONA} />);
    expect(screen.getByText('How to Reach Them')).toBeInTheDocument();
  });
});
