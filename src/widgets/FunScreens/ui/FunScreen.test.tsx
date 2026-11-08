import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { FunScreen } from './FunScreen';

describe('FunScreen', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => vi.useRealTimers());

  it('shutdown: a focused dialog that leaves after a while', () => {
    const onExit = vi.fn();
    render(<FunScreen variant="off" autoExitMs={3000} onExit={onExit} />);
    const dialog = screen.getByRole('dialog', {
      name: 'Agora é seguro desligar o computador.',
    });
    expect(dialog).toHaveFocus();
    act(() => vi.advanceTimersByTime(2999));
    expect(onExit).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('blue screen: any key or click leaves', () => {
    const onExit = vi.fn();
    render(<FunScreen variant="bsod" onExit={onExit} />);
    expect(screen.getByRole('dialog')).toHaveTextContent('O CAFÉ ACABOU');
    fireEvent.keyDown(window, { key: 'q' });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onExit).toHaveBeenCalledTimes(2);
  });

  it('setup: any key or click leaves', () => {
    const onExit = vi.fn();
    render(<FunScreen variant="setup" onExit={onExit} />);
    expect(screen.getByRole('dialog')).toHaveTextContent('Velocidade do café');
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onExit).toHaveBeenCalledTimes(2);
  });
});
