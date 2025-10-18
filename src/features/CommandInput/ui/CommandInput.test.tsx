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

  it('should navigate through command history with ArrowUp', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    // Type and submit multiple commands
    await user.type(inputElement, 'first command{Enter}');
    await user.type(inputElement, 'second command{Enter}');
    await user.type(inputElement, 'third command{Enter}');

    // Press ArrowUp to get last command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('third command');

    // Press ArrowUp again to get second-to-last command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('second command');

    // Press ArrowUp again to get first command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('first command');
  });

  it('should not go beyond the first command with ArrowUp', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(inputElement, 'only command{Enter}');

    // Press ArrowUp to get the command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('only command');

    // Press ArrowUp again - should stay on the same command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('only command');
  });

  it('should navigate forward through history with ArrowDown', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    // Create some history
    await user.type(inputElement, 'first{Enter}');
    await user.type(inputElement, 'second{Enter}');
    await user.type(inputElement, 'third{Enter}');

    // Navigate backwards
    await user.type(inputElement, '{ArrowUp}');
    await user.type(inputElement, '{ArrowUp}');
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('first');

    // Navigate forwards
    await user.type(inputElement, '{ArrowDown}');
    expect(inputElement.value).toBe('second');

    await user.type(inputElement, '{ArrowDown}');
    expect(inputElement.value).toBe('third');
  });

  it('should clear input when navigating past the end with ArrowDown', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(inputElement, 'command{Enter}');

    // Navigate to history
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('command');

    // Navigate past the end
    await user.type(inputElement, '{ArrowDown}');
    expect(inputElement.value).toBe('');
  });

  it('should not do anything with ArrowUp when history is empty', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('');
  });

  it('should not do anything with ArrowDown when not navigating history', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(inputElement, 'test');
    await user.type(inputElement, '{ArrowDown}');
    expect(inputElement.value).toBe('test');
  });

  it('should reset history index after submitting a command', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<CommandInput onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLInputElement;

    // Create history
    await user.type(inputElement, 'first{Enter}');
    await user.type(inputElement, 'second{Enter}');

    // Navigate to history
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('second');

    // Submit a new command
    await user.type(inputElement, ' modified{Enter}');

    // Next ArrowUp should get the last command
    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('second modified');
  });
});
