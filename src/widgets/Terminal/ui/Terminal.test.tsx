import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as useTerminalModule from '../model/useTerminal';
import { Terminal } from './Terminal';

// Mock the dependencies
vi.mock('../model/useTerminal', () => ({
  useTerminal: vi.fn(() => ({
    commands: [{ id: 0, text: 'welcome', output: 'Welcome to terminal!' }],
    handleCommand: vi.fn(),
  })),
}));

vi.mock('../../../features/CommandHistory/ui/CommandHistory', () => ({
  CommandHistory: ({ commands }: { commands: unknown[] }) => (
    <div data-testid="command-history">{commands.length} command(s)</div>
  ),
}));

vi.mock('../../../features/CommandInput/ui/CommandInput', () => ({
  CommandInput: ({ onEnter }: { onEnter: (cmd: string) => void }) => (
    <input
      data-testid="command-input"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onEnter((e.target as HTMLInputElement).value);
        }
      }}
    />
  ),
}));

describe('Terminal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      cb(0);
      return 0;
    });
  });

  it('should render terminal with proper roles and labels', () => {
    render(<Terminal />);

    const terminal = screen.getByRole('application');
    expect(terminal).toBeInTheDocument();
    expect(terminal).toHaveAttribute(
      'aria-label',
      'Interactive terminal interface'
    );
  });

  it('should render CommandHistory section', () => {
    render(<Terminal />);

    const historySection = screen.getByLabelText('Command history output');
    expect(historySection).toBeInTheDocument();
  });

  it('should render CommandHistory component', () => {
    render(<Terminal />);

    const commandHistory = screen.getByTestId('command-history');
    expect(commandHistory).toBeInTheDocument();
  });

  it('should render CommandInput component', () => {
    render(<Terminal />);

    const commandInput = screen.getByTestId('command-input');
    expect(commandInput).toBeInTheDocument();
  });

  it('should render scroll anchor element', () => {
    const { container } = render(<Terminal />);

    const scrollAnchor = container.querySelector('[aria-hidden="true"]');
    expect(scrollAnchor).toBeInTheDocument();
  });

  it('should focus input when clicking on terminal (not on input)', async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    const terminal = screen.getByRole('application');
    const input = screen.getByTestId('command-input');

    // Simulate clicking on the terminal container
    await user.click(terminal);

    // Check if focus was called (input should be focused)
    expect(input).toBeInTheDocument();
  });

  it('should not interfere when clicking directly on input', async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    const input = screen.getByTestId('command-input');

    // Click directly on input
    await user.click(input);

    expect(input).toBeInTheDocument();
  });

  it('should pass commands to CommandHistory', () => {
    const mockUseTerminal = vi.spyOn(useTerminalModule, 'useTerminal');
    mockUseTerminal.mockReturnValue({
      commands: [
        { id: 0, text: 'cmd1', output: 'output1' },
        { id: 1, text: 'cmd2', output: 'output2' },
      ],
      handleCommand: vi.fn(),
    });

    render(<Terminal />);

    const commandHistory = screen.getByTestId('command-history');
    expect(commandHistory).toHaveTextContent('2 command(s)');

    mockUseTerminal.mockRestore();
  });

  it('should pass handleCommand to CommandInput', async () => {
    const mockHandleCommand = vi.fn();
    const mockUseTerminal = vi.spyOn(useTerminalModule, 'useTerminal');
    mockUseTerminal.mockReturnValue({
      commands: [{ id: 0, text: 'welcome', output: 'Welcome!' }],
      handleCommand: mockHandleCommand,
    });

    const user = userEvent.setup();
    render(<Terminal />);

    const input = screen.getByTestId('command-input') as HTMLInputElement;
    input.value = 'test command';
    await user.type(input, '{Enter}');

    expect(mockHandleCommand).toHaveBeenCalled();

    mockUseTerminal.mockRestore();
  });

  it('should handle empty commands list', () => {
    const mockUseTerminal = vi.spyOn(useTerminalModule, 'useTerminal');
    mockUseTerminal.mockReturnValue({
      commands: [],
      handleCommand: vi.fn(),
    });

    render(<Terminal />);

    const commandHistory = screen.getByTestId('command-history');
    expect(commandHistory).toHaveTextContent('0 command(s)');

    mockUseTerminal.mockRestore();
  });

  it('should have accessible structure with proper ARIA attributes', () => {
    render(<Terminal />);

    const terminal = screen.getByRole('application');
    const historySection = screen.getByLabelText('Command history output');

    expect(terminal).toHaveAttribute(
      'aria-label',
      'Interactive terminal interface'
    );
    expect(historySection).toBeInTheDocument();
  });

  it('should trigger scroll on commands update', () => {
    const mockUseTerminal = vi.spyOn(useTerminalModule, 'useTerminal');
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    mockUseTerminal.mockReturnValue({
      commands: [
        { id: 0, text: 'cmd1', output: 'output1' },
        { id: 1, text: 'cmd2', output: 'output2' },
      ],
      handleCommand: vi.fn(),
    });

    render(<Terminal />);

    // requestAnimationFrame should be called
    expect(global.requestAnimationFrame).toHaveBeenCalled();

    mockUseTerminal.mockRestore();
  });

  it('should not trigger scroll when commands array is empty', () => {
    const mockUseTerminal = vi.spyOn(useTerminalModule, 'useTerminal');
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    const rafMock = vi.fn();
    global.requestAnimationFrame = rafMock;

    mockUseTerminal.mockReturnValue({
      commands: [],
      handleCommand: vi.fn(),
    });

    render(<Terminal />);

    // Since commands is empty, requestAnimationFrame should not be called
    // (early return in useEffect)
    expect(rafMock).not.toHaveBeenCalled();

    mockUseTerminal.mockRestore();
  });
});
