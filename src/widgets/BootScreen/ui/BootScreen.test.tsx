import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import {
  BIOS_MS,
  BootScreen,
  DOS_MS,
  REDUCED_MS,
  SPLASH_MS,
} from './BootScreen';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const boot = () => screen.getByTestId('boot-screen');

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe('BootScreen', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    setReducedMotion(false);
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('plays the BIOS, then DOS, then the logo, then finishes', () => {
    const onFinish = vi.fn();
    render(<BootScreen onFinish={onFinish} />);

    expect(boot()).toHaveAttribute('data-phase', 'bios');
    expect(boot()).toHaveAttribute('aria-hidden', 'true');
    expect(boot()).toHaveTextContent('CC BIOS');
    // The memory ends at 16384K.
    advance(BIOS_MS - 100);
    expect(boot()).toHaveTextContent('16384K OK');

    advance(100);
    expect(boot()).toHaveAttribute('data-phase', 'dos');
    advance(DOS_MS - 100);
    expect(boot()).toHaveTextContent('Carregando café');
    expect(boot()).toHaveTextContent('C:\\> win');

    advance(100);
    expect(boot()).toHaveAttribute('data-phase', 'splash');
    expect(boot().querySelector('img')).toHaveAttribute(
      'src',
      '/resources/abertura.webp'
    );
    expect(onFinish).not.toHaveBeenCalled();

    advance(SPLASH_MS);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('shows the lines in English', async () => {
    await act(() => i18n.changeLanguage('en-US'));
    render(<BootScreen onFinish={vi.fn()} />);
    expect(boot()).toHaveTextContent('Press any key to skip');
    advance(BIOS_MS + DOS_MS - 100);
    expect(boot()).toHaveTextContent('Brewing coffee');
  });

  it('skips on a key or a click, only once', () => {
    const onFinish = vi.fn();
    render(<BootScreen onFinish={onFinish} />);
    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.click(boot());
    expect(onFinish).toHaveBeenCalledTimes(1);
    advance(BIOS_MS + DOS_MS + SPLASH_MS);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('with reduced motion, shows only the still logo, briefly', () => {
    setReducedMotion(true);
    const onFinish = vi.fn();
    render(<BootScreen onFinish={onFinish} />);
    expect(boot()).toHaveAttribute('data-phase', 'splash');
    advance(REDUCED_MS - 100);
    expect(onFinish).not.toHaveBeenCalled();
    advance(100);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
