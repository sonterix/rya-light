import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AudienceCard } from './audience-card';

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

describe('AudienceCard', () => {
  it('displays the audience name', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={42}
        isActive={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('My Audience')).toBeInTheDocument();
  });

  it('displays the respondent count', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={42}
        isActive={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('calls onSelect with audience id when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        isActive={false}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('aud-1');
  });

  it('applies active styling when isActive is true', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        isActive={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not apply active styling when isActive is false', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        isActive={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
