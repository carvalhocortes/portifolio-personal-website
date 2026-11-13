import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { SUITS, type Card } from '../model/cards';
import * as gameModule from '../model/game';
import { DRAW_COUNT_KEY } from '../model/useSolitaire';
import { Solitaire } from './Solitaire';

const card = (suit: Card['suit'], rank: number, faceUp = true): Card => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  faceUp,
});

// One move from the end: every card on the foundations but the King of
// spades, alone in the first column.
const almostWon = (): gameModule.GameState => ({
  stock: [],
  waste: [],
  foundations: SUITS.map((suit) =>
    Array.from({ length: suit === 'spades' ? 12 : 13 }, (_, i) =>
      card(suit, i + 1)
    )
  ),
  tableau: [[card('spades', 13)], [], [], [], [], [], []],
  moves: 0,
  drawCount: 1,
});

const pile = (name: string | RegExp) => screen.getByRole('button', { name });

describe('Solitaire', () => {
  beforeEach(async () => {
    localStorage.removeItem(DRAW_COUNT_KEY);
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  afterEach(() => vi.restoreAllMocks());

  it('deals the cards: 24 in the stock and 1 to 7 per column', () => {
    render(<Solitaire isActive />);
    expect(pile('Monte: 24 cartas')).toBeInTheDocument();
    expect(pile('Descarte vazio')).toBeInTheDocument();
    expect(pile('Fundação 1 vazia')).toBeInTheDocument();
    expect(pile(/^Coluna 1: [^,]+$/)).toBeInTheDocument();
    expect(pile(/^Coluna 7: 6 cartas escondidas, /)).toBeInTheDocument();
    expect(screen.getByText('Jogadas: 0')).toBeInTheDocument();
  });

  it('turns a card with a click on the stock, and Undo puts it back', () => {
    render(<Solitaire isActive />);
    fireEvent.click(pile('Monte: 24 cartas'));
    expect(pile('Monte: 23 cartas')).toBeInTheDocument();
    expect(pile(/^Descarte: /)).toBeInTheDocument();
    expect(screen.getByText('Jogadas: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Jogo' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Desfazer' }));
    expect(pile('Monte: 24 cartas')).toBeInTheDocument();
    expect(pile('Descarte vazio')).toBeInTheDocument();
  });

  it('plays with the keyboard: Enter on the stock turns a card', () => {
    render(<Solitaire isActive />);
    fireEvent.keyDown(pile('Monte: 24 cartas'), { key: 'Enter' });
    expect(pile('Monte: 23 cartas')).toBeInTheDocument();
  });

  it('switches to 3 cards, deals again and remembers the choice', () => {
    const { unmount } = render(<Solitaire isActive />);
    fireEvent.click(pile('Monte: 24 cartas'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jogo' }));
    fireEvent.click(
      screen.getByRole('menuitemradio', { name: 'Virar 3 cartas' })
    );
    expect(screen.getByText('Jogadas: 0')).toBeInTheDocument();
    fireEvent.click(pile('Monte: 24 cartas'));
    expect(pile('Monte: 21 cartas')).toBeInTheDocument();
    expect(localStorage.getItem(DRAW_COUNT_KEY)).toBe('3');

    unmount();
    render(<Solitaire isActive />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jogo' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'Virar 3 cartas' })
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps the game when the draw mode already in use is picked', () => {
    render(<Solitaire isActive />);
    fireEvent.click(pile('Monte: 24 cartas'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jogo' }));
    fireEvent.click(
      screen.getByRole('menuitemradio', { name: 'Virar 1 carta' })
    );
    expect(pile('Monte: 23 cartas')).toBeInTheDocument();
    expect(screen.getByText('Jogadas: 1')).toBeInTheDocument();
  });

  it('opens the menu with the keyboard and closes it with Esc', () => {
    render(<Solitaire isActive />);
    const game = screen.getByRole('menuitem', { name: 'Jogo' });
    fireEvent.keyDown(game, { key: 'ArrowDown' });
    const menu = screen.getByRole('menu', { name: 'Jogo' });
    expect(
      within(menu).getByRole('menuitem', { name: 'Novo jogo' })
    ).toHaveFocus();
    // Undo is disabled with nothing to undo, so the arrow skips it.
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(
      within(menu).getByRole('menuitemradio', { name: 'Virar 1 carta' })
    ).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(game).toHaveFocus();
  });

  it('shows how to play and closes with Esc', () => {
    render(<Solitaire isActive />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Ajuda' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Como jogar' }));
    const dialog = screen.getByRole('dialog', { name: 'Como jogar' });
    expect(dialog).toHaveTextContent('do Ás ao Rei');
    expect(within(dialog).getByRole('button', { name: 'OK' })).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    // The focus goes back to the table, not to the page behind.
    expect(pile('Monte: 24 cartas')).toHaveFocus();
  });

  it('closes the window from Jogo > Sair', () => {
    const onClose = vi.fn();
    render(<Solitaire isActive onClose={onClose} />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Jogo' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));
    expect(onClose).toHaveBeenCalled();
  });

  describe('one move from winning', () => {
    beforeEach(() => {
      vi.spyOn(gameModule, 'deal').mockImplementation(almostWon);
    });

    it('a click on the King sends it to its foundation and wins', () => {
      render(<Solitaire isActive />);
      const king = document.querySelector('[data-card="spades-13"]')!;
      fireEvent.click(king);
      expect(pile('Fundação 1: Rei de espadas')).toBeInTheDocument();
      expect(
        screen.getByText('Rei de espadas para a fundação')
      ).toBeInTheDocument();
      const won = screen.getByRole('dialog', { name: 'Você venceu!' });
      expect(won).toHaveTextContent('1 jogada.');
      expect(
        within(won).getByRole('button', { name: 'Jogar de novo' })
      ).toHaveFocus();
    });

    it('also wins from the keyboard, and Play again deals a new game', () => {
      render(<Solitaire isActive />);
      fireEvent.keyDown(pile('Coluna 1: Rei de espadas'), { key: ' ' });
      fireEvent.click(screen.getByRole('button', { name: 'Jogar de novo' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(pile('Monte vazio')).toHaveFocus();
      expect(pile('Coluna 1: Rei de espadas')).toBeInTheDocument();
    });

    it('says when a pile has no move', () => {
      render(<Solitaire isActive />);
      fireEvent.keyDown(pile('Coluna 2 vazia'), { key: 'Enter' });
      expect(screen.getByText('Nenhuma jogada possível')).toBeInTheDocument();
    });
  });
});
