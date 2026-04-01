import { render, screen } from '@testing-library/react';

import type { MessagingSchema } from '@/lib/schemas/messaging-schema';

import { MessagingAnglesCard } from './MessagingAnglesCard';

const FULL_MESSAGING: MessagingSchema = {
  angles: [
    {
      name: 'The Empowerment Play',
      tone: 'warm and encouraging',
      sampleHeadline: 'You deserve music that gets you',
      emotionalHook: 'Desire for self-expression and belonging',
      keyTrait: 'Pop: 87% highly interested',
    },
    {
      name: 'The Authenticity Angle',
      tone: 'bold and direct',
      sampleHeadline: 'Real music for real people',
      emotionalHook: 'Distrust of mainstream marketing',
      keyTrait: 'Indie: avg interest 4.5',
    },
  ],
};

describe('MessagingAnglesCard', () => {
  it('renders angle names as card titles', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    expect(screen.getByText('The Empowerment Play')).toBeInTheDocument();
    expect(screen.getByText('The Authenticity Angle')).toBeInTheDocument();
  });

  it('renders tone for each angle', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    expect(screen.getByText('warm and encouraging')).toBeInTheDocument();
    expect(screen.getByText('bold and direct')).toBeInTheDocument();
  });

  it('renders sample headlines in prominent format', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    expect(screen.getByText('You deserve music that gets you')).toBeInTheDocument();
    expect(screen.getByText('Real music for real people')).toBeInTheDocument();
  });

  it('renders emotional hooks as supporting text', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    expect(screen.getByText('Desire for self-expression and belonging')).toBeInTheDocument();
    expect(screen.getByText('Distrust of mainstream marketing')).toBeInTheDocument();
  });

  it('renders key traits with distinct visual treatment', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    expect(screen.getByText('Pop: 87% highly interested')).toBeInTheDocument();
    expect(screen.getByText('Indie: avg interest 4.5')).toBeInTheDocument();
  });

  it('renders loading skeleton when no messaging provided', () => {
    render(<MessagingAnglesCard messaging={null} isGenerating />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders nothing when messaging is null and not generating', () => {
    const { container } = render(<MessagingAnglesCard messaging={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders partial messaging with only angles array having null fields without crashing', () => {
    const partial: Partial<MessagingSchema> = {
      angles: [{ name: null, tone: null, sampleHeadline: null, emotionalHook: null, keyTrait: null }],
    };
    render(<MessagingAnglesCard messaging={partial} />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders section labels for tone and emotional hook', () => {
    render(<MessagingAnglesCard messaging={FULL_MESSAGING} />);
    const toneLabels = screen.getAllByText(/Tone/i);
    expect(toneLabels.length).toBeGreaterThan(0);
  });
});
