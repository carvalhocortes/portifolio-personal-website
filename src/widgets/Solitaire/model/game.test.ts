import { describe, expect, it } from 'vitest';
import {
  createDeck,
  last,
  seededRandom,
  shuffle,
  type Card,
  type Suit,
} from './cards';
import {
  canDrop,
  deal,
  draw,
  findAutoMove,
  findPileMove,
  isWon,
  move,
  pickUp,
  type GameState,
} from './game';

const card = (suit: Suit, rank: number, faceUp = true): Card => ({
  id: `${suit}-${rank}`,
  suit,
  rank,
  faceUp,
});

const empty = (over: Partial<GameState> = {}): GameState => ({
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  moves: 0,
  drawCount: 1,
  ...over,
});

describe('deck', () => {
  it('has 52 different cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
  });

  it('shuffles without losing cards, the same way for the same seed', () => {
    const deck = createDeck();
    const a = shuffle(deck, seededRandom(7));
    expect(a).not.toEqual(deck);
    expect([...a].sort((x, y) => x.id.localeCompare(y.id))).toEqual(
      [...deck].sort((x, y) => x.id.localeCompare(y.id))
    );
    expect(shuffle(deck, seededRandom(7))).toEqual(a);
  });
});

describe('deal', () => {
  it('puts 28 cards in the columns and 24 in the stock, no repeats', () => {
    const game = deal(1, seededRandom(1));
    expect(game.tableau.map((c) => c.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(game.stock).toHaveLength(24);
    const ids = [...game.stock, ...game.tableau.flat()].map((c) => c.id);
    expect(new Set(ids).size).toBe(52);
  });

  it('turns only the top card of each column face up', () => {
    const game = deal(1, seededRandom(2));
    for (const column of game.tableau) {
      expect(column.map((c) => c.faceUp)).toEqual(
        column.map((_, i) => i === column.length - 1)
      );
    }
    expect(game.stock.every((c) => !c.faceUp)).toBe(true);
  });
});

describe('draw', () => {
  it('turns one card onto the waste', () => {
    const game = deal(1, seededRandom(3));
    const next = draw(game);
    expect(next.stock).toHaveLength(23);
    expect(next.waste).toEqual([{ ...last(game.stock)!, faceUp: true }]);
    expect(next.moves).toBe(1);
  });

  it('turns three cards in draw-3 mode, the last one on top', () => {
    const game = deal(3, seededRandom(3));
    const next = draw(game);
    expect(next.waste.map((c) => c.id)).toEqual(
      game.stock
        .slice(-3)
        .reverse()
        .map((c) => c.id)
    );
  });

  it('brings the waste back to the stock when it runs out', () => {
    let game = deal(3, seededRandom(4));
    const order = game.stock.map((c) => c.id);
    for (let i = 0; i < 8; i++) game = draw(game);
    expect(game.stock).toHaveLength(0);
    game = draw(game);
    expect(game.waste).toHaveLength(0);
    expect(game.stock.map((c) => c.id)).toEqual(order);
    expect(game.stock.every((c) => !c.faceUp)).toBe(true);
  });

  it('does nothing with both stock and waste empty', () => {
    const game = empty();
    expect(draw(game)).toBe(game);
  });
});

describe('rules', () => {
  it('builds columns down by one, alternating colours', () => {
    const game = empty({
      tableau: [[card('spades', 8)], [], [], [], [], [], []],
    });
    expect(canDrop(game, [card('hearts', 7)], 'tableau-0')).toBe(true);
    expect(canDrop(game, [card('clubs', 7)], 'tableau-0')).toBe(false);
    expect(canDrop(game, [card('hearts', 6)], 'tableau-0')).toBe(false);
  });

  it('takes only a King in an empty column', () => {
    const game = empty();
    expect(canDrop(game, [card('hearts', 13)], 'tableau-1')).toBe(true);
    expect(canDrop(game, [card('hearts', 12)], 'tableau-1')).toBe(false);
  });

  it('builds foundations up from the Ace, one suit each', () => {
    const game = empty({ foundations: [[card('hearts', 1)], [], [], []] });
    expect(canDrop(game, [card('hearts', 2)], 'foundation-0')).toBe(true);
    expect(canDrop(game, [card('diamonds', 2)], 'foundation-0')).toBe(false);
    expect(canDrop(game, [card('clubs', 1)], 'foundation-1')).toBe(true);
    expect(canDrop(game, [card('clubs', 2)], 'foundation-1')).toBe(false);
  });

  it('picks up only the top of the waste and face-up runs', () => {
    const game = empty({
      waste: [card('clubs', 3), card('clubs', 4)],
      tableau: [
        [card('spades', 9, false), card('hearts', 8), card('clubs', 7)],
        [card('hearts', 8), card('hearts', 7)],
        [],
        [],
        [],
        [],
        [],
      ],
    });
    expect(pickUp(game, 'waste', 0)).toBeNull();
    expect(pickUp(game, 'waste', 1)).toHaveLength(1);
    expect(pickUp(game, 'tableau-0', 0)).toBeNull();
    expect(pickUp(game, 'tableau-0', 1)).toHaveLength(2);
    expect(pickUp(game, 'tableau-1', 0)).toBeNull();
  });
});

describe('move', () => {
  it('moves a run and turns the hidden card left on top', () => {
    const game = empty({
      tableau: [
        [card('spades', 2, false), card('hearts', 8), card('clubs', 7)],
        [card('spades', 9)],
        [],
        [],
        [],
        [],
        [],
      ],
    });
    const next = move(game, 'tableau-0', 1, 'tableau-1')!;
    expect(next.tableau[1].map((c) => c.id)).toEqual([
      'spades-9',
      'hearts-8',
      'clubs-7',
    ]);
    expect(next.tableau[0]).toEqual([card('spades', 2, true)]);
    expect(next.moves).toBe(1);
    // The old state is untouched (Undo relies on it).
    expect(game.tableau[0][0].faceUp).toBe(false);
  });

  it('refuses a move against the rules', () => {
    const game = empty({
      tableau: [[card('clubs', 7)], [card('spades', 9)], [], [], [], [], []],
    });
    expect(move(game, 'tableau-0', 0, 'tableau-1')).toBeNull();
    expect(move(game, 'tableau-0', 0, 'tableau-0')).toBeNull();
  });
});

describe('automatic move (one click)', () => {
  it('sends a card to a foundation first', () => {
    const game = empty({
      waste: [card('hearts', 1)],
      tableau: [[card('spades', 2)], [], [], [], [], [], []],
    });
    expect(findAutoMove(game, 'waste', 0)).toEqual({
      from: 'waste',
      index: 0,
      to: 'foundation-0',
    });
  });

  it('or to the first column that takes it', () => {
    const game = empty({
      waste: [card('hearts', 7)],
      tableau: [[card('hearts', 8)], [card('clubs', 8)], [], [], [], [], []],
    });
    expect(findAutoMove(game, 'waste', 0)?.to).toBe('tableau-1');
  });

  it('skips a King at the bottom going to another empty column', () => {
    const game = empty({
      tableau: [[card('hearts', 13)], [], [], [], [], [], []],
    });
    expect(findAutoMove(game, 'tableau-0', 0)).toBeNull();
  });

  it('finds the best move of a whole column for the keyboard', () => {
    const game = empty({
      tableau: [
        [card('spades', 5, false), card('hearts', 8), card('clubs', 7)],
        [card('spades', 9)],
        [],
        [],
        [],
        [],
        [],
      ],
    });
    expect(findPileMove(game, 'tableau-0')).toEqual({
      from: 'tableau-0',
      index: 1,
      to: 'tableau-1',
    });
  });
});

it('is won with the 52 cards on the foundations', () => {
  const full = (suit: Suit) =>
    Array.from({ length: 13 }, (_, i) => card(suit, i + 1));
  expect(isWon(empty())).toBe(false);
  expect(
    isWon(
      empty({
        foundations: [
          full('spades'),
          full('hearts'),
          full('diamonds'),
          full('clubs'),
        ],
      })
    )
  ).toBe(true);
});
