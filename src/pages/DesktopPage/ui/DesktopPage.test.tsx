import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import DesktopPage from './DesktopPage';

const setWidth = (width: number) =>
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });

const openChrome = async () => {
  const user = userEvent.setup();
  render(<DesktopPage />);
  const icons = screen.getByRole('list', { name: 'Programas' });
  await user.click(within(icons).getByRole('button', { name: 'Chrome' }));
  const chrome = await screen.findByRole('region', { name: 'Chrome' });
  return { user, chrome };
};

describe('DesktopPage', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => setWidth(1024));

  it('opens with Chrome and the Terminal minimized on the taskbar', () => {
    setWidth(1280);
    render(<DesktopPage />);
    const icons = screen.getByRole('list', { name: 'Programas' });
    expect(
      within(icons).getByRole('button', { name: 'Chrome' })
    ).toBeInTheDocument();
    expect(
      within(icons).getByRole('button', { name: 'Terminal' })
    ).toBeInTheDocument();
    // Minimized: no window shows, each one has its taskbar button.
    expect(screen.queryByRole('region', { name: 'Chrome' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Terminal' })).toBeNull();
    const tasks = screen.getByRole('navigation', { name: 'Janelas abertas' });
    for (const name of ['Chrome', 'Terminal']) {
      expect(within(tasks).getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    }
    // The landing page loads only when Chrome shows up.
    expect(document.querySelector('.lp-root')).toBeNull();
    expect(document.documentElement.dataset.route).toBe('desktop');
  });

  it('shows a minimized program with one click on its taskbar button', async () => {
    setWidth(1280);
    const user = userEvent.setup();
    render(<DesktopPage />);
    const tasks = screen.getByRole('navigation', { name: 'Janelas abertas' });
    await user.click(within(tasks).getByRole('button', { name: 'Terminal' }));
    expect(
      screen.getByRole('region', { name: 'Terminal' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Chrome' })).toBeNull();
  });

  it('opens the landing page inside Chrome, with a read-only address bar', async () => {
    setWidth(1280);
    const { chrome } = await openChrome();
    const address = within(chrome).getByRole('textbox', { name: 'Endereço' });
    expect(address).toHaveValue('Fernando Cortes - Engenheiro de software');
    expect(address).toHaveAttribute('readonly');
    for (const name of ['Voltar', 'Avançar', 'Recarregar']) {
      expect(within(chrome).getByRole('button', { name })).toBeDisabled();
    }
    expect(
      await within(chrome).findByRole('heading', {
        level: 1,
        name: 'Fernando Cortes',
      })
    ).toBeInTheDocument();
  });

  it('keeps the photo viewer inside the Chrome window', async () => {
    setWidth(1280);
    const { user, chrome } = await openChrome();
    const photo = await within(chrome).findAllByRole('button', {
      name: /Ampliar a foto/,
    });
    await user.click(photo[0]);
    const dialog = within(chrome).getByRole('dialog');
    expect(dialog.closest('.lp-root')).toHaveAttribute('data-embedded');
  });

  it('switches Chrome and the desktop language together', async () => {
    setWidth(1280);
    const { user, chrome } = await openChrome();
    await within(chrome).findByRole('heading', { level: 2, name: 'Sobre' });
    await user.click(
      within(chrome).getByRole('button', { name: /mudar o idioma/i })
    );
    expect(
      within(chrome).getByRole('textbox', { name: 'Address' })
    ).toHaveValue('Fernando Cortes - Software engineer');
    expect(screen.getByRole('button', { name: /Start/ })).toBeInTheDocument();
  });

  it('shows the landing page alone on phones', async () => {
    setWidth(375);
    render(<DesktopPage />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Fernando Cortes' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar/ })).toBeNull();
    expect(screen.queryByRole('list', { name: 'Programas' })).toBeNull();
    expect(document.documentElement.dataset.route).toBe('landing');
  });
});
