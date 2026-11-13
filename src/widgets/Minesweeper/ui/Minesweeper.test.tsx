import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { contentSize } from '../model/layout';
import { LEVELS } from '../model/levels';
import { LEVEL_KEY, RECORDS_KEY } from '../model/storage';
import { Minesweeper } from './Minesweeper';

// Mines in fixed places: the whole first row and the first cell of the
// second (indexes 0 to 9). Cell 80, the bottom-right corner, opens the rest
// of the board at once.
const fixed = vi.hoisted(() => ({
  mines: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as number[] | undefined,
}));
vi.mock('../model/game', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../model/game')>();
  return {
    ...actual,
    createGame: (...[level, mines]: Parameters<typeof actual.createGame>) =>
      actual.createGame(level, mines ?? fixed.mines),
  };
});

const cell = (row: number, col: number) =>
  screen.getByRole('gridcell', {
    name: new RegExp(`^Linha ${row}, coluna ${col}:`),
  });
const counterValue = (name: RegExp) =>
  screen.getByRole('img', { name }).getAttribute('data-value');
const minesCounter = () => counterValue(/minas? restantes?/);
const timer = () => counterValue(/segundos?$/);
const face = () =>
  screen
    .getByRole('button', { name: 'Novo jogo' })
    .querySelector('svg')
    ?.getAttribute('data-mood');

const renderGame = () => {
  const onFitContent = vi.fn();
  const user = userEvent.setup();
  render(<Minesweeper isActive onFitContent={onFitContent} />);
  return { user, onFitContent };
};

describe('Minesweeper', () => {
  beforeEach(async () => {
    localStorage.removeItem(LEVEL_KEY);
    localStorage.removeItem(RECORDS_KEY);
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on the beginner board, the size the window opens at', () => {
    const { onFitContent } = renderGame();
    expect(screen.getAllByRole('gridcell')).toHaveLength(81);
    expect(minesCounter()).toBe('010');
    expect(timer()).toBe('000');
    expect(face()).toBe('smile');
    expect(onFitContent).not.toHaveBeenCalled();
  });

  it('opens a number on a click and starts the clock', () => {
    vi.useFakeTimers();
    render(<Minesweeper isActive />);
    fireEvent.click(cell(2, 2));
    expect(cell(2, 2)).toHaveAccessibleName(
      'Linha 2, coluna 2: 4 minas vizinhas'
    );
    expect(cell(2, 2)).toHaveTextContent('4');
    expect(timer()).toBe('001');
    act(() => vi.advanceTimersByTime(3000));
    expect(timer()).toBe('004');
  });

  it('puts and takes a flag with the right click, and the counter follows', () => {
    renderGame();
    fireEvent.contextMenu(cell(1, 1));
    expect(cell(1, 1)).toHaveAccessibleName('Linha 1, coluna 1: bandeira');
    expect(minesCounter()).toBe('009');
    // A flagged cell does not open on a click.
    fireEvent.click(cell(1, 1));
    expect(face()).toBe('smile');
    fireEvent.contextMenu(cell(1, 1));
    expect(cell(1, 1)).toHaveAccessibleName('Linha 1, coluna 1: fechada');
    expect(minesCounter()).toBe('010');
  });

  it('opens the cells around a number when its flags match (chord)', async () => {
    const { user } = renderGame();
    await user.click(cell(2, 2));
    for (const [r, c] of [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
    ]) {
      fireEvent.contextMenu(cell(r, c));
    }
    await user.click(cell(2, 2));
    expect(cell(3, 3)).toHaveAccessibleName(/vazia|vizinha/);
    expect(cell(2, 3)).toHaveAccessibleName(/minas vizinhas/);
  });

  it('loses on a mine: shows the mines and stops', async () => {
    const { user } = renderGame();
    fireEvent.contextMenu(cell(9, 9));
    await user.click(cell(1, 1));
    expect(face()).toBe('dead');
    expect(cell(1, 1)).toHaveAccessibleName(
      'Linha 1, coluna 1: mina explodida'
    );
    expect(cell(1, 2)).toHaveAccessibleName('Linha 1, coluna 2: mina');
    expect(cell(9, 9)).toHaveAccessibleName(
      'Linha 9, coluna 9: bandeira errada'
    );
    expect(screen.getByRole('status')).toHaveTextContent(/Bum!/);
    await user.click(cell(5, 5));
    expect(cell(5, 5)).toHaveAccessibleName('Linha 5, coluna 5: fechada');
  });

  it('wins, keeps the best time and shows it in the records', async () => {
    const { user } = renderGame();
    await user.click(cell(9, 9));
    expect(face()).toBe('cool');
    expect(minesCounter()).toBe('000');
    expect(screen.getByRole('status')).toHaveTextContent('Novo recorde: 1 s!');
    expect(JSON.parse(localStorage.getItem(RECORDS_KEY)!)).toEqual({
      beginner: 1,
    });

    await user.click(screen.getByRole('button', { name: 'Jogo' }));
    await user.click(screen.getByRole('menuitem', { name: 'Recordes…' }));
    const dialog = screen.getByRole('dialog', { name: 'Recordes' });
    expect(within(dialog).getByText('Iniciante').nextSibling).toHaveTextContent(
      '1 s'
    );
    expect(within(dialog).getByText('Avançado').nextSibling).toHaveTextContent(
      '-'
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jogo' })).toHaveFocus();
  });

  it('a slower win is not a record', async () => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify({ beginner: 1 }));
    const { user } = renderGame();
    await user.click(cell(9, 9));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Você venceu em 1 segundo!'
    );
  });

  it('starts over with the face', async () => {
    const { user } = renderGame();
    await user.click(cell(1, 1));
    expect(face()).toBe('dead');
    await user.click(screen.getByRole('button', { name: 'Novo jogo' }));
    expect(face()).toBe('smile');
    expect(timer()).toBe('000');
    expect(cell(1, 1)).toHaveAccessibleName('Linha 1, coluna 1: fechada');
  });

  it('changes the level from the menu, saves it and refits the window', async () => {
    const { user, onFitContent } = renderGame();
    await user.click(screen.getByRole('button', { name: 'Jogo' }));
    expect(
      screen.getByRole('menuitemradio', { name: /Iniciante/ })
    ).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: /Avançado/ }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(30 * 16);
    expect(minesCounter()).toBe('099');
    expect(localStorage.getItem(LEVEL_KEY)).toBe('expert');
    expect(onFitContent).toHaveBeenLastCalledWith(contentSize(LEVELS.expert));
  });

  it('opens on the saved level', () => {
    localStorage.setItem(LEVEL_KEY, 'intermediate');
    const { onFitContent } = renderGame();
    expect(screen.getAllByRole('gridcell')).toHaveLength(16 * 16);
    expect(onFitContent).toHaveBeenCalledWith(contentSize(LEVELS.intermediate));
  });

  it('the menu works with the keyboard and closes with Esc', async () => {
    const { user } = renderGame();
    await user.click(screen.getByRole('button', { name: 'Jogo' }));
    expect(screen.getByRole('menuitem', { name: 'Novo' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitemradio', { name: /Iniciante/ })
    ).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Recordes…' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jogo' })).toHaveFocus();
  });

  it('leaves Ctrl and Cmd shortcuts to the browser', () => {
    renderGame();
    fireEvent.keyDown(cell(1, 1), { key: 'f', metaKey: true });
    fireEvent.keyDown(cell(1, 1), { key: 'f', ctrlKey: true });
    expect(cell(1, 1)).toHaveAccessibleName('Linha 1, coluna 1: fechada');
  });

  it('keeps the game behind the records dialog out of reach', async () => {
    const { user } = renderGame();
    await user.click(screen.getByRole('button', { name: 'Jogo' }));
    await user.click(screen.getByRole('menuitem', { name: 'Recordes…' }));
    expect(screen.getByRole('dialog', { name: 'Recordes' })).toHaveAttribute(
      'aria-modal',
      'true'
    );
    expect(
      screen.getByRole('grid', { hidden: true }).closest('[inert]')
    ).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.getByRole('grid').closest('[inert]')).toBeNull();
  });

  it('can be played with the keyboard only', async () => {
    const { user } = renderGame();
    // Only one cell is in the tab order.
    await user.tab(); // Jogo
    await user.tab(); // Novo jogo
    await user.tab();
    expect(cell(1, 1)).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cell(2, 2)).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowUp}{ArrowUp}');
    expect(cell(1, 1)).toHaveFocus();
    await user.keyboard('f');
    expect(cell(1, 1)).toHaveAccessibleName('Linha 1, coluna 1: bandeira');
    await user.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    expect(cell(2, 2)).toHaveAccessibleName(
      'Linha 2, coluna 2: 4 minas vizinhas'
    );
    await user.tab({ shift: true });
    await user.tab();
    expect(cell(2, 2)).toHaveFocus();
  });
});
