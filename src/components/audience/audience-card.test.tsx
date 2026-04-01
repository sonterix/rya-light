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
        filterCount={2}
        isActive={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('My Audience')).toBeInTheDocument();
  });

  it('displays the respondent count', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={42}
        filterCount={2}
        isActive={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('calls onSelect with audience id when card button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={false}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'My Audience' }));

    expect(onSelect).toHaveBeenCalledWith('aud-1');
  });

  it('applies active styling when isActive is true', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={true}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'My Audience' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not apply active styling when isActive is false', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'My Audience' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders a delete button', () => {
    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Delete audience' })).toBeInTheDocument();
  });

  it('calls onDelete with audience id when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={false}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete audience' }));

    expect(onDelete).toHaveBeenCalledWith('aud-1');
  });

  it('does not call onSelect when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AudienceCard
        audience={TEST_AUDIENCE}
        respondentCount={10}
        filterCount={2}
        isActive={false}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete audience' }));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
