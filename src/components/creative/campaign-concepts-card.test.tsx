import { render, screen } from '@testing-library/react';

import type { CampaignSchema } from '@/lib/schemas/campaign-schema';

import { CampaignConceptsCard } from './campaign-concepts-card';

const FULL_CAMPAIGN: CampaignSchema = {
  concepts: [
    {
      name: 'Summer Beats',
      tagline: 'Feel the rhythm this summer',
      description: 'A summer-themed campaign targeting pop and electronic fans. Leverages festival culture and outdoor events. Drives brand awareness through experiential activations.',
      targetGenres: ['Pop', 'Electronic', 'Dance'],
      suggestedFormat: 'Social campaign',
    },
    {
      name: 'Urban Pulse',
      tagline: 'Move to the sound of your city',
      description: 'Hip-hop focused urban campaign. Speaks to city dwellers with authentic street culture. Uses local influencers and micro-creators.',
      targetGenres: ['Hip-Hop', 'R&B'],
      suggestedFormat: 'Video series',
    },
  ],
};

describe('CampaignConceptsCard', () => {
  it('renders concept names as card titles', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    expect(screen.getByText('Summer Beats')).toBeInTheDocument();
    expect(screen.getByText('Urban Pulse')).toBeInTheDocument();
  });

  it('renders taglines', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    expect(screen.getByText('Feel the rhythm this summer')).toBeInTheDocument();
    expect(screen.getByText('Move to the sound of your city')).toBeInTheDocument();
  });

  it('renders descriptions as body text', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    expect(screen.getByText(/festival culture/)).toBeInTheDocument();
    expect(screen.getByText(/street culture/)).toBeInTheDocument();
  });

  it('renders target genre tags', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('Electronic')).toBeInTheDocument();
    expect(screen.getByText('Dance')).toBeInTheDocument();
    expect(screen.getByText('Hip-Hop')).toBeInTheDocument();
    expect(screen.getByText('R&B')).toBeInTheDocument();
  });

  it('renders suggested formats', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    expect(screen.getByText('Social campaign')).toBeInTheDocument();
    expect(screen.getByText('Video series')).toBeInTheDocument();
  });

  it('renders loading skeleton when no campaign provided', () => {
    render(<CampaignConceptsCard campaign={null} isGenerating />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when campaign is null and not generating', () => {
    const { container } = render(<CampaignConceptsCard campaign={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders partial campaign with only concepts array having null fields', () => {
    const partial: Partial<CampaignSchema> = {
      concepts: [{ name: null, tagline: null, description: null, targetGenres: [], suggestedFormat: null }],
    };
    render(<CampaignConceptsCard campaign={partial} />);
    // Should not crash - renders without throwing
    expect(document.body).toBeInTheDocument();
  });

  it('renders suggested format label', () => {
    render(<CampaignConceptsCard campaign={FULL_CAMPAIGN} />);
    const labels = screen.getAllByText(/Format/i);
    expect(labels.length).toBeGreaterThan(0);
  });
});
