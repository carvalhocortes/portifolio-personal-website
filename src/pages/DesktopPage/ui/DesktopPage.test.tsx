import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';
import { BOOTED_KEY } from '../../../shared/lib/bootMark';
import DesktopPage from './DesktopPage';

const setWidth = (width: number) =>
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });

const openBrowser = async () => {
  const user = userEvent.setup();
  render(<DesktopPage />);
  const icons = screen.getByRole('list', { name: 'Programas' });
  await user.click(within(icons).getByRole('button', { name: 'Navegador' }));
  const browser = await screen.findByRole('region', { name: 'Navegador' });
  return { user, browser };
};

describe('DesktopPage', () => {
  beforeEach(async () => {
    Element.prototype.scrollIntoView = vi.fn();
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => setWidth(1024));

  it('opens with the Leia-me.txt in front and the others minimized', () => {
    setWidth(1280);
    render(<DesktopPage />);
    const icons = screen.getByRole('list', { name: 'Programas' });
    expect(
      within(icons).getByRole('button', { name: 'Navegador' })
    ).toBeInTheDocument();
    expect(
      within(icons).getByRole('button', { name: 'Terminal' })
    ).toBeInTheDocument();
    // Minimized: no window shows, each one has its taskbar button.
    expect(screen.queryByRole('region', { name: 'Navegador' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Terminal' })).toBeNull();
    const tasks = screen.getByRole('navigation', { name: 'Janelas abertas' });
    for (const name of ['Navegador', 'Terminal']) {
      expect(within(tasks).getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    }
    // The Leia-me.txt is the open, active window.
    expect(
      screen.getByRole('region', { name: 'Leia-me.txt - Bloco de Notas' })
    ).toBeInTheDocument();
    expect(
      within(tasks).getByRole('button', { name: 'Leia-me.txt' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(icons).getByRole('button', { name: 'Leia-me.txt' })
    ).toBeInTheDocument();
    // The Clock is open too, behind the Leia-me; the Recycle Bin is closed.
    expect(screen.getByRole('region', { name: 'Relógio' })).toBeInTheDocument();
    expect(
      within(tasks).getByRole('button', { name: 'Relógio' })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('region', { name: 'Lixeira' })).toBeNull();
    expect(
      within(icons)
        .getAllByRole('button')
        .map((icon) => icon.textContent)
    ).toEqual(['Navegador', 'Terminal', 'Leia-me.txt', 'Relógio', 'Lixeira']);
    // The landing page loads only when the browser shows up.
    expect(document.querySelector('.lp-root')).toBeNull();
    expect(document.documentElement.dataset.route).toBe('desktop');
  });

  it('opens the Clock from the time in the taskbar', async () => {
    setWidth(1280);
    const user = userEvent.setup();
    render(<DesktopPage />);
    const tasks = screen.getByRole('navigation', { name: 'Janelas abertas' });
    await user.click(
      within(screen.getByRole('region', { name: 'Relógio' })).getByRole(
        'button',
        { name: 'Fechar' }
      )
    );
    expect(screen.queryByRole('region', { name: 'Relógio' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Abrir o Relógio' }));
    expect(screen.getByRole('region', { name: 'Relógio' })).toBeInTheDocument();
    expect(
      within(tasks).getByRole('button', { name: 'Relógio' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the taskbar order when another window gets the focus', async () => {
    setWidth(1280);
    const user = userEvent.setup();
    render(<DesktopPage />);
    const tasks = screen.getByRole('navigation', { name: 'Janelas abertas' });
    const order = () =>
      within(tasks)
        .getAllByRole('button')
        .map((b) => b.textContent);
    await user.click(within(tasks).getByRole('button', { name: 'Terminal' }));
    await user.click(within(tasks).getByRole('button', { name: 'Navegador' }));
    await user.click(within(tasks).getByRole('button', { name: 'Terminal' }));
    expect(order()).toEqual([
      'Navegador',
      'Terminal',
      'Relógio',
      'Leia-me.txt',
    ]);
    expect(
      within(tasks).getByRole('button', { name: 'Terminal' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(tasks).getByRole('button', { name: 'Navegador' })
    ).toHaveAttribute('aria-pressed', 'false');
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
    expect(screen.queryByRole('region', { name: 'Navegador' })).toBeNull();
  });

  it('opens the landing page inside the browser, with a read-only address bar', async () => {
    setWidth(1280);
    const { browser } = await openBrowser();
    const address = within(browser).getByRole('textbox', { name: 'Endereço' });
    expect(address).toHaveValue(
      `${content.pessoa.nome} - Engenheiro de software`
    );
    expect(address).toHaveAttribute('readonly');
    for (const name of ['Voltar', 'Avançar', 'Recarregar']) {
      expect(within(browser).getByRole('button', { name })).toBeDisabled();
    }
    expect(
      await within(browser).findByRole('heading', {
        level: 1,
        name: content.pessoa.nome,
      })
    ).toBeInTheDocument();
  });

  it('keeps the photo viewer inside the browser window', async () => {
    setWidth(1280);
    const { user, browser } = await openBrowser();
    const photo = await within(browser).findAllByRole('button', {
      name: /Ampliar a foto/,
    });
    await user.click(photo[0]);
    const dialog = within(browser).getByRole('dialog');
    expect(dialog.closest('.lp-root')).toHaveAttribute('data-embedded');
  });

  it('switches the browser and the desktop language together', async () => {
    setWidth(1280);
    const { user, browser } = await openBrowser();
    await within(browser).findByRole('heading', { level: 2, name: 'Sobre' });
    await user.click(
      within(browser).getByRole('button', { name: /mudar o idioma/i })
    );
    expect(
      within(browser).getByRole('textbox', { name: 'Address' })
    ).toHaveValue(`${content.pessoa.nome} - Software engineer`);
    expect(screen.getByRole('button', { name: /Start/ })).toBeInTheDocument();
  });

  it('shows the landing page alone on phones', async () => {
    setWidth(375);
    render(<DesktopPage />);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: content.pessoa.nome,
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar/ })).toBeNull();
    expect(screen.queryByRole('list', { name: 'Programas' })).toBeNull();
    expect(document.documentElement.dataset.route).toBe('landing');
  });

  describe('boot screen', () => {
    beforeEach(() => {
      sessionStorage.removeItem(BOOTED_KEY);
      vi.useFakeTimers();
    });

    afterEach(() => vi.useRealTimers());

    it('plays over the desktop on the first visit, then marks the tab', () => {
      setWidth(1280);
      render(<DesktopPage />);
      expect(screen.getByTestId('boot-screen')).toBeInTheDocument();
      // The desktop is already there, out of reach until the boot ends.
      expect(screen.getByRole('main', { hidden: true })).toHaveAttribute(
        'inert'
      );
      act(() => vi.advanceTimersByTime(4000));
      expect(screen.queryByTestId('boot-screen')).toBeNull();
      expect(screen.getByRole('main')).not.toHaveAttribute('inert');
      expect(sessionStorage.getItem(BOOTED_KEY)).toBe('1');
    });

    it('a key skips straight to the desktop', () => {
      setWidth(1280);
      render(<DesktopPage />);
      fireEvent.keyDown(window, { key: ' ' });
      expect(screen.queryByTestId('boot-screen')).toBeNull();
      expect(sessionStorage.getItem(BOOTED_KEY)).toBe('1');
    });

    it('is skipped when the tab has already seen it', () => {
      setWidth(1280);
      sessionStorage.setItem(BOOTED_KEY, '1');
      render(<DesktopPage />);
      expect(screen.queryByTestId('boot-screen')).toBeNull();
    });

    it('does not show on phones', () => {
      setWidth(375);
      render(<DesktopPage />);
      expect(screen.queryByTestId('boot-screen')).toBeNull();
    });
  });
});
