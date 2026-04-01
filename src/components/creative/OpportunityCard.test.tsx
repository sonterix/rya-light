import { render, screen } from '@testing-library/react';

import type { OpportunitySchema } from '@/lib/schemas/opportunity-schema';

import { OpportunityCard } from './OpportunityCard';

const FULL_OPPORTUNITY: OpportunitySchema = {
  opportunities: [
    {
      gapGenre: 'Classical',
      audienceTrait: 'High household income ($120k+)',
      crossoverConcept: 'Exclusive classical listening experiences paired with luxury brand messaging',
      reasoning: 'High income audiences often seek premium cultural experiences even when classical shows low baseline interest',
      confidence: 'high',
    },
    {
      gapGenre: 'Jazz',
      audienceTrait: 'Urban, 25-34 demographic',
      crossoverConcept: 'Jazz-influenced lo-fi study playlists targeting young professionals',
      reasoning: 'Young urban professionals work long hours and seek focus music even if they do not identify as jazz fans',
      confidence: 'medium',
    },
    {
      gapGenre: 'Country',
      audienceTrait: 'Suburban families with children',
      crossoverConcept: 'Family-friendly country anthems for road trips and outdoor activities',
      reasoning: 'Suburban families share music across generations, creating an entry point for country',
      confidence: 'low',
    },
  ],
};

describe('OpportunityCard', () => {
  it('renders each gap genre as a card title', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    expect(screen.getByText('Classical')).toBeInTheDocument();
    expect(screen.getByText('Jazz')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders audience trait prominently', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    expect(screen.getByText('High household income ($120k+)')).toBeInTheDocument();
    expect(screen.getByText('Urban, 25-34 demographic')).toBeInTheDocument();
  });

  it('renders crossover concept as main body text', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    expect(screen.getByText(/luxury brand messaging/)).toBeInTheDocument();
    expect(screen.getByText(/lo-fi study playlists/)).toBeInTheDocument();
  });

  it('renders reasoning as supporting text', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    expect(screen.getByText(/premium cultural experiences/)).toBeInTheDocument();
    expect(screen.getByText(/work long hours/)).toBeInTheDocument();
  });

  it('renders confidence badge for high confidence with green styling', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    const highBadge = screen.getByText('high');
    expect(highBadge).toBeInTheDocument();
    expect(highBadge.className).toMatch(/green/);
  });

  it('renders confidence badge for medium confidence with yellow styling', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    const mediumBadge = screen.getByText('medium');
    expect(mediumBadge).toBeInTheDocument();
    expect(mediumBadge.className).toMatch(/yellow/);
  });

  it('renders confidence badge for low confidence with gray styling', () => {
    render(<OpportunityCard opportunity={FULL_OPPORTUNITY} />);
    const lowBadge = screen.getByText('low');
    expect(lowBadge).toBeInTheDocument();
    expect(lowBadge.className).toMatch(/gray|slate/);
  });

  it('renders loading skeleton when null and generating', () => {
    render(<OpportunityCard opportunity={null} isGenerating />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when opportunity is null and not generating', () => {
    const { container } = render(<OpportunityCard opportunity={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with partial data that has no opportunities yet', () => {
    const partial: Partial<OpportunitySchema> = {};
    render(<OpportunityCard opportunity={partial} isGenerating />);
    // Should not crash
    expect(document.body).toBeInTheDocument();
  });

  it('renders with nullable fields gracefully', () => {
    const withNulls: OpportunitySchema = {
      opportunities: [
        {
          gapGenre: null,
          audienceTrait: null,
          crossoverConcept: null,
          reasoning: null,
          confidence: 'medium',
        },
      ],
    };
    render(<OpportunityCard opportunity={withNulls} />);
    expect(screen.getByText('medium')).toBeInTheDocument();
  });
});
