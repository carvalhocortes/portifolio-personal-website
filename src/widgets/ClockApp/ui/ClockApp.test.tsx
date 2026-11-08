import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { handAngles, longDate } from '../lib/time';
import { CLOCK_MODE_KEY, ClockApp } from './ClockApp';

const renderClock = () => render(<ClockApp isActive />);
const hand = (name: string) =>
  document.querySelector(`[data-hand="${name}"]`)!.getAttribute('data-angle');

describe('ClockApp', () => {
  beforeEach(async () => {
    localStorage.removeItem(CLOCK_MODE_KEY);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 8, 15, 30, 0));
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => vi.useRealTimers());

  it('points the hands at the time', () => {
    expect(handAngles(new Date(2026, 0, 1, 3, 0, 0))).toEqual({
      hour: 90,
      minute: 0,
      second: 0,
    });
    expect(handAngles(new Date(2026, 0, 1, 15, 30, 15)).hour).toBeCloseTo(
      105.125
    );
  });

  it('starts analog and ticks every second', () => {
    renderClock();
    expect(screen.getByRole('radio', { name: 'Analógico' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(hand('second')).toBe('0.0');
    act(() => vi.advanceTimersByTime(1000));
    expect(hand('second')).toBe('6.0');
    expect(
      screen.getByRole('img', { name: /Agora são 15:30/ })
    ).toBeInTheDocument();
  });

  it('switches to digital, shows the date and remembers the choice', () => {
    const { unmount } = renderClock();
    fireEvent.click(screen.getByRole('radio', { name: 'Digital' }));
    expect(screen.getByRole('radio', { name: 'Digital' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByText('15:30:00')).toBeInTheDocument();
    expect(
      screen.getByText('Domingo, 8 de novembro de 2026')
    ).toBeInTheDocument();
    expect(localStorage.getItem(CLOCK_MODE_KEY)).toBe('digital');

    unmount();
    renderClock();
    expect(screen.getByRole('radio', { name: 'Digital' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('writes the date in the site language', async () => {
    expect(longDate(new Date(2026, 10, 8), 'en-US')).toBe(
      'Sunday, November 8, 2026'
    );
    await act(() => i18n.changeLanguage('en-US'));
    renderClock();
    expect(screen.getByRole('radio', { name: 'Analog' })).toBeInTheDocument();
  });
});
