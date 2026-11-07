import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CommandInput } from './CommandInput';

// The terminal owns the history; this harness plays that role in tests.
const WithHistory = ({ onEnter }: { onEnter: (command: string) => void }) => {
  const [history, setHistory] = useState<string[]>([]);
  return (
    <CommandInput
      history={history}
      onEnter={(command) => {
        setHistory((prev) => [...prev, command]);
        onEnter(command);
      }}
    />
  );
};

describe('CommandInput Component', () => {
  it('should render prompt and input', () => {
    render(<WithHistory onEnter={vi.fn()} />);

    const promptElement = screen.getByRole('img');
    const inputElement = screen.getByRole('textbox');

    expect(promptElement).toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
  });

  it('should call onEnter when Enter is pressed with text', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, 'help{Enter}');

    expect(handleEnter).toHaveBeenCalledWith('help');
  });

  it('should NOT call onEnter when Enter is pressed with empty text', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, '{Enter}');

    expect(handleEnter).not.toHaveBeenCalled();
  });

  it('should NOT call onEnter with only whitespace', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, '   {Enter}');

    expect(handleEnter).not.toHaveBeenCalled();
  });

  it('should clear input after Enter', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(inputElement, 'test command{Enter}');

    expect(inputElement.value).toBe('');
  });

  it('should have input with autoFocus', () => {
    render(<WithHistory onEnter={vi.fn()} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveFocus();
  });

  it('should have aria-label on input for accessibility', () => {
    render(<WithHistory onEnter={vi.fn()} />);
    const inputElement = screen.getByLabelText('Terminal command input');
    expect(inputElement).toBeInTheDocument();
  });

  it('should display prompt with "current" variant', () => {
    render(<WithHistory onEnter={vi.fn()} />);
    const promptElement = screen.getByRole('img');
    expect(promptElement).toHaveAttribute('aria-label', 'Command prompt');
  });

  it('should navigate through command history with ArrowUp', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

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
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

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
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

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
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

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
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(inputElement, '{ArrowUp}');
    expect(inputElement.value).toBe('');
  });

  it('should not do anything with ArrowDown when not navigating history', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(inputElement, 'test');
    await user.type(inputElement, '{ArrowDown}');
    expect(inputElement.value).toBe('test');
  });

  it('should reset history index after submitting a command', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);

    const inputElement = screen.getByRole('textbox') as HTMLTextAreaElement;

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

describe('CommandInput (DOS)', () => {
  it('uses the history passed by the terminal for ArrowUp', async () => {
    const user = userEvent.setup();
    render(<CommandInput onEnter={vi.fn()} history={['sobre', 'dir']} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('dir');
    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('sobre');
  });

  it('renders the DOS cursor', () => {
    render(<WithHistory onEnter={vi.fn()} />);
    expect(screen.getByTestId('dos-cursor')).toBeInTheDocument();
  });

  it('shows the typed text with the cursor at the caret position', async () => {
    const user = userEvent.setup();
    render(<WithHistory onEnter={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.type(input, 'sobre{ArrowLeft}{ArrowLeft}');
    const cursor = screen.getByTestId('dos-cursor');
    expect(cursor.previousSibling?.textContent).toBe('sob');
    expect(cursor.nextSibling?.textContent).toBe('re');
  });

  it('never inserts line breaks: Enter runs the command, pasted breaks become spaces', async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<WithHistory onEnter={handleEnter} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;

    await user.click(input);
    await user.paste('trabalho\nvoluntario');
    expect(input.value).toBe('trabalho voluntario');

    await user.type(input, '{Enter}');
    expect(handleEnter).toHaveBeenCalledWith('trabalho voluntario');
    expect(input.value).toBe('');
  });

  it('wraps the textarea exactly like the visible mirror', () => {
    render(<WithHistory onEnter={vi.fn()} />);
    const input = screen.getByRole('textbox');
    const mirror = screen.getByTestId('dos-cursor').parentElement!;
    // Same class rules for wrapping are what keeps clicks aligned.
    expect(input.tagName).toBe('TEXTAREA');
    expect(mirror).toHaveAttribute('aria-hidden', 'true');
  });
});
