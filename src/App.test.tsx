import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { content } from './entities/Content';
import i18n from './shared/i18n';

const goTo = (path: string) => window.history.pushState({}, '', path);

describe('App', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, 'innerWidth', {
      value: 1280,
      configurable: true,
    });
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => goTo('/'));

  it('opens the desktop at the root', async () => {
    goTo('/');
    render(<App />);
    expect(
      await screen.findByRole(
        'region',
        { name: /área de trabalho/i },
        { timeout: 5000 } // the first lazy page chunk is slow in tests
      )
    ).toBeInTheDocument();
  });

  it('opens only the Terminal at /terminal', async () => {
    goTo('/terminal');
    render(<App />);
    expect(await screen.findByRole('application')).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('opens only the landing page at /landing', async () => {
    goTo('/landing');
    render(<App />);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: content.pessoa.nome,
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('application')).not.toBeInTheDocument();
  });

  it('keeps <html lang> with the site language', async () => {
    render(<App />);
    expect(document.documentElement.lang).toBe('pt-BR');
    await act(() => i18n.changeLanguage('en-US'));
    expect(document.documentElement.lang).toBe('en');
  });
});
