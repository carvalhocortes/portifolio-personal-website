import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { WindowManagerProvider } from '../../../features/WindowManager';
import i18n from '../../../shared/i18n';
import { formatClock } from '../../Taskbar/lib/formatClock';
import { Desktop } from './Desktop';

const Notes = ({ isActive }: { isActive: boolean }) => (
  <p>{isActive ? 'notes active' : 'notes inactive'}</p>
);
const Paint = ({ isActive }: { isActive: boolean }) => (
  <p>{isActive ? 'paint active' : 'paint inactive'}</p>
);
const Icon = () => <svg aria-hidden="true" />;

// Two fake programs keep these tests about the desktop, not the terminal.
const PROGRAMS = [
  {
    id: 'terminal',
    titleKey: 'programs.terminal',
    Icon,
    Component: Notes,
    defaultSize: { width: 500, height: 300 },
  },
  {
    id: 'paint',
    titleKey: 'Paint',
    Icon,
    Component: Paint,
    defaultSize: { width: 400, height: 300 },
  },
] as unknown as ProgramDefinition[];

/** Renders the desktop with the given programs set to start open. */
const renderDesktop = (startup: string[] = []) =>
  render(
    <WindowManagerProvider>
      <Desktop
        programs={PROGRAMS.map((program) =>
          startup.includes(program.id)
            ? { ...program, startup: 'open' as const }
            : program
        )}
      />
    </WindowManagerProvider>
  );

const windowNamed = (name: string) => screen.getByRole('region', { name });
const titleBar = (name: string) =>
  windowNamed(name).querySelector('h2')!.parentElement!;

describe('Desktop', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      configurable: true,
    });
  });

  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('opens the startup program and shows the taskbar', () => {
    // A fixed time: otherwise the minute can turn between the render and the
    // check of the clock text, and the test fails once in a while.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 8, 10, 30, 0));
    renderDesktop(['terminal']);
    expect(windowNamed('Terminal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Terminal', pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatClock(new Date(), 'pt-BR'))
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('opens a program with one click, and brings it to the front if already open', async () => {
    const user = userEvent.setup();
    renderDesktop();
    const icons = screen.getByRole('list', { name: 'Programas' });

    await user.click(within(icons).getByRole('button', { name: 'Terminal' }));
    expect(screen.getByText('notes active')).toBeInTheDocument();

    await user.click(within(icons).getByRole('button', { name: 'Paint' }));
    expect(screen.getByText('notes inactive')).toBeInTheDocument();
    expect(screen.getByText('paint active')).toBeInTheDocument();

    await user.click(within(icons).getByRole('button', { name: 'Terminal' }));
    expect(screen.getAllByRole('region', { name: 'Terminal' })).toHaveLength(1);
    expect(screen.getByText('notes active')).toBeInTheDocument();
  });

  it('opens a program with Enter', async () => {
    const user = userEvent.setup();
    renderDesktop();
    within(screen.getByRole('list', { name: 'Programas' }))
      .getByRole('button', { name: 'Terminal' })
      .focus();
    await user.keyboard('{Enter}');
    expect(windowNamed('Terminal')).toBeInTheDocument();
  });

  it('minimizes, restores from the taskbar, maximizes and closes', async () => {
    const user = userEvent.setup();
    renderDesktop(['terminal']);
    const win = windowNamed('Terminal');

    await user.click(within(win).getByRole('button', { name: 'Minimizar' }));
    expect(win).not.toBeVisible();
    const task = screen.getByRole('button', {
      name: 'Terminal',
      pressed: false,
    });

    await user.click(task);
    expect(win).toBeVisible();
    expect(task).toHaveAttribute('aria-pressed', 'true');

    // Clicking the active window's taskbar button minimizes it.
    await user.click(task);
    expect(win).not.toBeVisible();
    await user.click(task);

    await user.click(within(win).getByRole('button', { name: 'Maximizar' }));
    expect(
      within(win).getByRole('button', { name: 'Restaurar' })
    ).toBeInTheDocument();
    await user.dblClick(titleBar('Terminal'));
    expect(
      within(win).getByRole('button', { name: 'Maximizar' })
    ).toBeInTheDocument();

    await user.click(within(win).getByRole('button', { name: 'Fechar' }));
    expect(
      screen.queryByRole('region', { name: 'Terminal' })
    ).not.toBeInTheDocument();
  });

  it('brings a clicked window to the front', async () => {
    const user = userEvent.setup();
    renderDesktop(['terminal', 'paint']);
    expect(screen.getByText('notes inactive')).toBeInTheDocument();
    await user.click(screen.getByText('notes inactive'));
    expect(screen.getByText('notes active')).toBeInTheDocument();
    expect(windowNamed('Terminal')).toHaveAttribute('data-active', 'true');
    expect(windowNamed('Paint')).toHaveAttribute('data-active', 'false');
  });

  it('drags a window by its title bar and keeps it on screen', () => {
    renderDesktop(['terminal']);
    const bar = titleBar('Terminal');
    const win = windowNamed('Terminal');
    const startLeft = parseInt(win.style.left, 10);

    fireEvent.pointerDown(bar, {
      pointerId: 1,
      button: 0,
      clientX: 200,
      clientY: 30,
    });
    fireEvent.pointerMove(bar, { pointerId: 1, clientX: 260, clientY: 90 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(parseInt(win.style.left, 10)).toBe(startLeft + 60);

    fireEvent.pointerDown(bar, {
      pointerId: 2,
      button: 0,
      clientX: 200,
      clientY: 30,
    });
    fireEvent.pointerMove(bar, {
      pointerId: 2,
      clientX: -5000,
      clientY: -5000,
    });
    fireEvent.pointerUp(bar, { pointerId: 2 });
    expect(win.style.left).toBe('0px');
    expect(win.style.top).toBe('0px');
  });

  it('resizes a window from its corner', () => {
    renderDesktop(['terminal']);
    const win = windowNamed('Terminal');
    const corner = win.querySelector('[data-resize="se"]')!;
    const width = parseInt(win.style.width, 10);

    fireEvent.pointerDown(corner, {
      pointerId: 3,
      button: 0,
      clientX: 600,
      clientY: 400,
    });
    fireEvent.pointerMove(corner, { pointerId: 3, clientX: 650, clientY: 440 });
    fireEvent.pointerUp(corner, { pointerId: 3 });
    expect(parseInt(win.style.width, 10)).toBe(width + 50);
  });

  it('opens the Start menu and closes it with Esc, outside click and items', async () => {
    const user = userEvent.setup();
    renderDesktop();
    const start = screen.getByRole('button', { name: /Iniciar/ });

    await user.click(start);
    const menu = screen.getByRole('menu', { name: 'Menu Iniciar' });
    expect(within(menu).getAllByRole('menuitem')[0]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(within(menu).getAllByRole('menuitem')[1]).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(start).toHaveFocus();

    await user.click(start);
    await user.click(screen.getByRole('region', { name: 'Área de trabalho' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(start);
    await user.click(screen.getByRole('menuitem', { name: 'Terminal' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(windowNamed('Terminal')).toBeInTheDocument();
  });

  it('switches the language from the taskbar and from the Start menu', async () => {
    const user = userEvent.setup();
    renderDesktop(['terminal']);

    await user.click(
      screen.getByRole('button', { name: 'PT, mudar o idioma para English' })
    );
    expect(screen.getByRole('button', { name: /Start/ })).toBeInTheDocument();
    expect(
      screen.getByText(formatClock(new Date(), 'en-US'))
    ).toBeInTheDocument();
    expect(
      within(windowNamed('Terminal')).getByRole('button', { name: 'Minimize' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Start/ }));
    const english = screen.getByRole('menuitemradio', { name: /en-US/ });
    expect(english).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: /pt-BR/ }));
    expect(screen.getByRole('button', { name: /Iniciar/ })).toBeInTheDocument();
    // The menu stays open, now with pt-BR pressed and en-US raised.
    expect(
      screen.getByRole('menuitemradio', { name: /pt-BR/ })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: /en-US/ })
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps the clock ticking', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 9, 59, 50));
    renderDesktop();
    expect(
      screen.getByText(formatClock(new Date(), 'pt-BR'))
    ).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(screen.getByText('10:00')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
