import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../../../entities/Content';
import i18n from '../../../shared/i18n';
import { BOOTED_KEY } from '../../../shared/lib/bootMark';
import { resetMussumForTests } from '../../../shared/i18n/mussumMode';
import DesktopPage, { SCREENSAVER_MS, SHUTDOWN_MS } from './DesktopPage';

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
    // The Clock is open too, behind the Leia-me; Solitaire, the Recycle Bin
    // and the Minesweeper are closed.
    expect(screen.getByRole('region', { name: 'Relógio' })).toBeInTheDocument();
    expect(
      within(tasks).getByRole('button', { name: 'Relógio' })
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('region', { name: 'Lixeira' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Paciência' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Campo Minado' })).toBeNull();
    expect(
      within(icons)
        .getAllByRole('button')
        .map((icon) => icon.textContent)
    ).toEqual([
      'Navegador',
      'Terminal',
      'Leia-me.txt',
      'Relógio',
      'Paciência',
      'Lixeira',
      'ICQ',
      'Campo Minado',
    ]);
    // The landing page loads only when the browser shows up.
    expect(document.querySelector('.lp-root')).toBeNull();
    expect(document.documentElement.dataset.route).toBe('desktop');
  });

  it('opens ICQ from the flower next to the clock', async () => {
    setWidth(1280);
    const user = userEvent.setup();
    render(<DesktopPage />);
    expect(screen.queryByRole('region', { name: 'ICQ' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Abrir o ICQ' }));
    expect(screen.getByRole('region', { name: 'ICQ' })).toBeInTheDocument();
  });

  it('opens Minesweeper and fits its window to the level', async () => {
    setWidth(1280);
    localStorage.removeItem('cc84.minesweeperLevel');
    const user = userEvent.setup();
    render(<DesktopPage />);
    const icons = screen.getByRole('list', { name: 'Programas' });
    await user.click(
      within(icons).getByRole('button', { name: 'Campo Minado' })
    );
    const game = screen.getByRole('region', { name: 'Campo Minado' });
    // Beginner: 9 × 24 px cells + 18 px of borders + 6 px of window frame.
    expect(game.style.width).toBe('320px');
    await user.click(within(game).getByRole('button', { name: 'Jogo' }));
    await user.click(
      within(game).getByRole('menuitemradio', { name: /Avançado/ })
    );
    // Expert: 30 × 24 + 18 + 6 wide, 16 × 24 + 84 + 28 tall.
    expect(game.style.width).toBe('744px');
    expect(game.style.height).toBe('496px');
    localStorage.removeItem('cc84.minesweeperLevel');
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

  it('brings a window to the front without moving it in the page', async () => {
    setWidth(1280);
    const user = userEvent.setup();
    render(<DesktopPage />);
    const clock = screen.getByRole('region', { name: 'Relógio' });
    const notepad = screen.getByRole('region', {
      name: 'Leia-me.txt - Bloco de Notas',
    });
    const pageOrder = () =>
      screen
        .getAllByRole('region')
        .map((region) => region.getAttribute('aria-label'))
        .filter((name) => name === 'Relógio' || name?.startsWith('Leia-me'));
    const before = pageOrder();
    // One click on a control of a window behind: it works and the window
    // comes to the front by its layer, not by moving in the page.
    await user.click(within(clock).getByRole('radio', { name: 'Digital' }));
    expect(
      within(clock).getByRole('radio', { name: 'Digital' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(pageOrder()).toEqual(before);
    expect(Number(clock.style.zIndex)).toBeGreaterThan(
      Number(notepad.style.zIndex)
    );
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
      'ICQ',
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

  describe('easter eggs', () => {
    const konami = () =>
      [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ].forEach((key) => fireEvent.keyDown(document.body, { key }));

    it('shuts down, then boots again after 3 seconds', () => {
      vi.useFakeTimers();
      setWidth(1280);
      render(<DesktopPage />);
      fireEvent.click(screen.getByRole('button', { name: /Iniciar/ }));
      fireEvent.click(screen.getByRole('menuitem', { name: /Desligar/ }));
      expect(
        screen.getByRole('dialog', {
          name: 'Agora é seguro desligar o computador.',
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('main', { hidden: true })).toHaveAttribute(
        'inert'
      );
      act(() => vi.advanceTimersByTime(SHUTDOWN_MS));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByTestId('boot-screen')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('restarts straight into the boot screen', () => {
      setWidth(1280);
      render(<DesktopPage />);
      fireEvent.click(screen.getByRole('button', { name: /Iniciar/ }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Reiniciar' }));
      expect(screen.getByTestId('boot-screen')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('shows the blue screen on the Konami code, and a key goes back', () => {
      setWidth(1280);
      render(<DesktopPage />);
      konami();
      expect(screen.getByRole('dialog')).toHaveTextContent('O CAFÉ ACABOU');
      fireEvent.keyDown(window, { key: 'x' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('ignores the Konami letters typed in a text field', () => {
      setWidth(1280);
      render(<DesktopPage />);
      const text = screen.getByRole('textbox', { name: 'Leia-me.txt' });
      [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ].forEach((key) => fireEvent.keyDown(text, { key }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    describe('Mussum mode', () => {
      const type = (text: string, target: Element = document.body) =>
        act(() =>
          [...text].forEach((key) => fireEvent.keyDown(target, { key }))
        );
      const startButton = () =>
        screen.getByRole('button', { name: /^Iniciar/ });
      const languageButton = (code: string) =>
        screen.getByRole('menuitemradio', {
          name: new RegExp(`\\(${code}\\)`),
        });

      afterEach(() => resetMussumForTests());

      it('turns on and off by typing cacildis on the desktop', () => {
        setWidth(1280);
        render(<DesktopPage />);
        type('cacildis');
        expect(i18n.language).toBe('pt-MUSSUM');
        expect(startButton()).toHaveTextContent('Iniciarzis');
        type('cacildis');
        expect(i18n.language).toBe('pt-BR');
        expect(startButton()).toHaveTextContent(/^Iniciar$/);
      });

      it('still turns on after a slip like cacacildis', () => {
        setWidth(1280);
        render(<DesktopPage />);
        type('cacacildis');
        expect(i18n.language).toBe('pt-MUSSUM');
      });

      it('ignores cacildis typed in a text field', () => {
        setWidth(1280);
        render(<DesktopPage />);
        type('cacildis', screen.getByRole('textbox', { name: 'Leia-me.txt' }));
        expect(i18n.language).toBe('pt-BR');
      });

      it('shows pt-MUSSUM in the Start menu after 3 clicks on pt-BR', () => {
        setWidth(1280);
        render(<DesktopPage />);
        fireEvent.click(startButton());
        expect(
          screen.queryByRole('menuitemradio', { name: /pt-MUSSUM/ })
        ).toBeNull();
        for (let i = 0; i < 3; i += 1) fireEvent.click(languageButton('pt-BR'));
        fireEvent.click(languageButton('pt-MUSSUM'));
        expect(i18n.language).toBe('pt-MUSSUM');
        expect(languageButton('pt-MUSSUM')).toHaveAttribute(
          'aria-checked',
          'true'
        );
        fireEvent.click(languageButton('en-US'));
        expect(i18n.language).toBe('en-US');
        // Still there until a reload.
        expect(languageButton('pt-MUSSUM')).toBeInTheDocument();
      });

      it('goes from English to Mussum and back to English', async () => {
        setWidth(1280);
        await act(() => i18n.changeLanguage('en-US'));
        render(<DesktopPage />);
        type('cacildis');
        expect(i18n.language).toBe('pt-MUSSUM');
        type('cacildis');
        expect(i18n.language).toBe('en-US');
      });
    });

    it('shows the screensaver after 2 idle minutes, until the mouse moves', () => {
      vi.useFakeTimers();
      setWidth(1280);
      render(<DesktopPage />);
      act(() => vi.advanceTimersByTime(SCREENSAVER_MS - 1000));
      expect(screen.queryByTestId('screensaver')).toBeNull();
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByTestId('screensaver')).toBeInTheDocument();
      fireEvent.pointerMove(window);
      expect(screen.queryByTestId('screensaver')).toBeNull();
      vi.useRealTimers();
    });

    it('adds Plus! to the Start menu after 10 clicks', () => {
      setWidth(1280);
      render(<DesktopPage />);
      const start = screen.getByRole('button', { name: /Iniciar/ });
      for (let i = 0; i < 10; i++) fireEvent.click(start);
      // An even number of clicks leaves the menu closed: open it once more.
      fireEvent.click(start);
      expect(screen.getByRole('menu')).toHaveTextContent('Plus!');
    });
  });
});
