import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandInput } from './CommandInput';

describe('CommandInput Component', () => {
  it('should render prompt and input', () => {
    render(<CommandInput onEnter={vi.fn()} />);

    const promptElement = screen.getByRole('img');
    const inputElement = screen.getByRole('textbox');

    expect(promptElement).toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
  });

  it('should call onEnter when Enter is pressed with text', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, 'help{Enter}');

    expect(handleEnter).toHaveBeenCalledWith('help');
  });

  it('should NOT call onEnter when Enter is pressed with empty text', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, '{Enter}');

    expect(handleEnter).not.toHaveBeenCalled();
  });

  it('should NOT call onEnter with only whitespace', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, '   {Enter}');

    expect(handleEnter).not.toHaveBeenCalled();
  });

  it('should clear input after Enter', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(inputElement, 'test command{Enter}');

    expect(inputElement.value).toBe('');
  });

  it('should have input with autoFocus', () => {
    render(<CommandInput onEnter={vi.fn()} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveFocus();
  });

  it('should have aria-label on input for accessibility', () => {
    render(<CommandInput onEnter={vi.fn()} />);
    const inputElement = screen.getByLabelText('Terminal command input');
    expect(inputElement).toBeInTheDocument();
  });

  it('should display prompt with "current" variant', () => {
    render(<CommandInput onEnter={vi.fn()} />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Command prompt');
  });
});
