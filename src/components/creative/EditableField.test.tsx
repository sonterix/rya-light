import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditableField } from './EditableField';

describe('EditableField', () => {
  it('renders the value as static text initially', () => {
    render(<EditableField value="Hello World" onSave={vi.fn()} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('switches to input mode on click', async () => {
    const user = userEvent.setup();
    render(<EditableField value="Hello World" onSave={vi.fn()} />);

    await user.click(screen.getByText('Hello World'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Hello World');
  });

  it('calls onSave with new value on blur', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField value="Hello" onSave={onSave} />);

    await user.click(screen.getByText('Hello'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Updated');
    await user.tab();

    expect(onSave).toHaveBeenCalledWith('Updated');
  });

  it('calls onSave with new value on Enter key', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField value="Hello" onSave={onSave} />);

    await user.click(screen.getByText('Hello'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'New value');
    await user.keyboard('{Enter}');

    expect(onSave).toHaveBeenCalledWith('New value');
  });

  it('cancels editing on Escape and restores original value', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField value="Original" onSave={onSave} />);

    await user.click(screen.getByText('Original'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Changed');
    await user.keyboard('{Escape}');

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('does not call onSave when value is unchanged', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableField value="Same" onSave={onSave} />);

    await user.click(screen.getByText('Same'));
    fireEvent.blur(screen.getByRole('textbox'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('renders placeholder when value is empty', () => {
    render(<EditableField value="" placeholder="Click to edit" onSave={vi.fn()} />);
    expect(screen.getByText('Click to edit')).toBeInTheDocument();
  });

  it('accepts a custom className', () => {
    render(<EditableField value="Hello" onSave={vi.fn()} className="custom-class" />);
    const element = screen.getByText('Hello');
    expect(element).toHaveClass('custom-class');
  });
});
