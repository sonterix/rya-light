import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import type { AudienceFilters } from '@/lib/filter-matching';

import { FilterControls } from './filter-controls';

function ControlledFilterControls({ initial = {} }: { initial?: AudienceFilters }) {
  const [filters, setFilters] = useState<AudienceFilters>(initial);
  return <FilterControls filters={filters} onChange={setFilters} />;
}

describe('FilterControls', () => {
  it('renders Audience Category label', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Audience Category')).toBeInTheDocument();
  });

  it('renders Age label', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders Gender label', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Gender')).toBeInTheDocument();
  });

  it('renders Region label', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Region')).toBeInTheDocument();
  });

  it('renders Advanced Filters toggle button', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /advanced filters/i })).toBeInTheDocument();
  });

  it('advanced filters are hidden by default', () => {
    render(<FilterControls filters={{}} onChange={vi.fn()} />);

    expect(screen.queryByText('Community Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Household Income')).not.toBeInTheDocument();
  });

  it('shows advanced filters after clicking toggle', async () => {
    const user = userEvent.setup();
    render(<FilterControls filters={{}} onChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /advanced filters/i }));

    expect(screen.getByText('Community Type')).toBeInTheDocument();
    expect(screen.getByText('Household Income')).toBeInTheDocument();
    expect(screen.getByText('Parent Status')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Employment Status')).toBeInTheDocument();
    expect(screen.getByText('Home Ownership')).toBeInTheDocument();
  });

  it('updates age min value when typed', async () => {
    const user = userEvent.setup();
    render(<ControlledFilterControls />);

    const minInput = screen.getByLabelText('Age min');
    await user.clear(minInput);
    await user.type(minInput, '25');

    expect(minInput).toHaveValue(25);
  });

  it('updates age max value when typed', async () => {
    const user = userEvent.setup();
    render(<ControlledFilterControls />);

    const maxInput = screen.getByLabelText('Age max');
    await user.clear(maxInput);
    await user.type(maxInput, '50');

    expect(maxInput).toHaveValue(50);
  });

  it('reflects existing age min filter value in input', () => {
    render(<FilterControls filters={{ age: { min: 30, max: 60 } }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Age min')).toHaveValue(30);
  });

  it('reflects existing age max filter value in input', () => {
    render(<FilterControls filters={{ age: { min: 30, max: 60 } }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Age max')).toHaveValue(60);
  });

  it('calls onChange when a gender option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterControls filters={{}} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Female' }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ gender: ['Female'] }));
  });

  it('deselects gender when clicked again', async () => {
    const user = userEvent.setup();
    render(<ControlledFilterControls />);

    await user.click(screen.getByRole('button', { name: 'Female' }));
    await user.click(screen.getByRole('button', { name: 'Female' }));

    expect(screen.getByRole('button', { name: 'Female' })).not.toHaveClass('bg-primary');
  });
});
