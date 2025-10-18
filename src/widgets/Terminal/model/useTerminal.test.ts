import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTerminal } from './useTerminal';

// Mock the dependencies
vi.mock('../../../shared/lib/useScreenSize', () => ({
  useScreenSize: vi.fn(() => 'medium'),
}));

vi.mock('../commands', () => ({
  executeCommand: vi.fn((command: string) => `Output for: ${command}`),
  getClearCommands: vi.fn(() => ['limpar', 'clear', 'cls']),
  getWelcomeCommands: vi.fn(() => ['bem-vindo', 'welcome', 'inicio', 'start']),
}));

describe('useTerminal Hook', () => {
  it('should initialize with a welcome command', () => {
    const { result } = renderHook(() => useTerminal());

    expect(result.current.commands).toHaveLength(1);
    expect(result.current.commands[0].id).toBe(0);
    expect(result.current.commands[0].text).toBe('bem-vindo');
    expect(result.current.commands[0].output).toBe('Output for: bem-vindo');
  });

  it('should add a new command when handleCommand is called', () => {
    const { result } = renderHook(() => useTerminal());

    act(() => {
      result.current.handleCommand('sobre');
    });

    expect(result.current.commands).toHaveLength(2);
    expect(result.current.commands[1].text).toBe('sobre');
    expect(result.current.commands[1].output).toBe('Output for: sobre');
  });

  it('should clear commands when a clear command is executed', () => {
    const { result } = renderHook(() => useTerminal());

    // Add some commands
    act(() => {
      result.current.handleCommand('sobre');
      result.current.handleCommand('contato');
    });

    expect(result.current.commands).toHaveLength(3);

    // Execute clear command
    act(() => {
      result.current.handleCommand('limpar');
    });

    expect(result.current.commands).toHaveLength(1);
    expect(result.current.commands[0].text).toBe('bem-vindo');
  });

  it('should handle clear command case-insensitively', () => {
    const { result } = renderHook(() => useTerminal());

    act(() => {
      result.current.handleCommand('sobre');
    });

    expect(result.current.commands).toHaveLength(2);

    act(() => {
      result.current.handleCommand('LIMPAR');
    });

    expect(result.current.commands).toHaveLength(1);
  });

  it('should handle clear command with whitespace', () => {
    const { result } = renderHook(() => useTerminal());

    act(() => {
      result.current.handleCommand('sobre');
    });

    act(() => {
      result.current.handleCommand('  clear  ');
    });

    expect(result.current.commands).toHaveLength(1);
  });

  it('should increment command IDs correctly', () => {
    const { result } = renderHook(() => useTerminal());

    // Initial state has 1 command (welcome)
    expect(result.current.commands).toHaveLength(1);
    expect(result.current.commands[0].id).toBe(0);

    // Add first command
    act(() => {
      result.current.handleCommand('sobre');
    });
    expect(result.current.commands).toHaveLength(2);
    expect(result.current.commands[1].id).toBe(1);

    // Add second command
    act(() => {
      result.current.handleCommand('contato');
    });
    expect(result.current.commands).toHaveLength(3);
    expect(result.current.commands[2].id).toBe(2);

    // Add third command
    act(() => {
      result.current.handleCommand('hobbies');
    });
    expect(result.current.commands).toHaveLength(4);
    expect(result.current.commands[3].id).toBe(3);
  });

  it('should handle multiple clear commands', () => {
    const { result } = renderHook(() => useTerminal());

    act(() => {
      result.current.handleCommand('sobre');
      result.current.handleCommand('cls');
    });

    expect(result.current.commands).toHaveLength(1);

    act(() => {
      result.current.handleCommand('contato');
      result.current.handleCommand('clear');
    });

    expect(result.current.commands).toHaveLength(1);
  });
});
