import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DesktopPage from './DesktopPage';

const setWidth = (width: number) =>
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });

describe('DesktopPage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => setWidth(1024));

  it('shows the desktop with the Terminal open on computers', async () => {
    setWidth(1280);
    render(<DesktopPage />);
    expect(
      await screen.findByRole('region', { name: 'Terminal' })
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // taskbar
  });

  it('shows only the Terminal, full screen, on phones', () => {
    setWidth(375);
    render(<DesktopPage />);
    expect(screen.getByRole('application')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Iniciar|Start/ })
    ).not.toBeInTheDocument();
  });
});
