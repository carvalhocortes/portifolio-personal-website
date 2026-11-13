import { createDeck, isRed, last, shuffle, type Card } from './cards';

export type DrawCount = 1 | 3;

/** Where cards lie. The top card of every pile is the last one. */
export type PileId =
  | 'stock'
  | 'waste'
  | `foundation-${0 | 1 | 2 | 3}`
  | `tableau-${0 | 1 | 2 | 3 | 4 | 5 | 6}`;

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  /** Moves and draws made so far. */
  moves: number;
  drawCount: DrawCount;
}

export const FOUNDATIONS = [0, 1, 2, 3].map((i) => `foundation-${i}` as PileId);
export const TABLEAU = [0, 1, 2, 3, 4, 5, 6].map(
  (i) => `tableau-${i}` as PileId
);

/** The position of a foundation or column, from 0. */
export const pileIndex = (id: PileId) => Number(id.split('-')[1]);
export const isFoundation = (id: PileId) => id.startsWith('foundation-');
export const isTableau = (id: PileId) => id.startsWith('tableau-');

export const getPile = (state: GameState, id: PileId): Card[] => {
  if (id === 'stock') return state.stock;
  if (id === 'waste') return state.waste;
  return isFoundation(id)
    ? state.foundations[pileIndex(id)]
    : state.tableau[pileIndex(id)];
};

// A copy of the state with one pile replaced.
const withPile = (state: GameState, id: PileId, cards: Card[]): GameState => {
  if (id === 'stock') return { ...state, stock: cards };
  if (id === 'waste') return { ...state, waste: cards };
  const key = isFoundation(id) ? 'foundations' : 'tableau';
  const piles = [...state[key]];
  piles[pileIndex(id)] = cards;
  return { ...state, [key]: piles };
};

/**
 * A new game: 1 to 7 cards in the seven columns, only the top one face up,
 * and the other 24 face down in the stock.
 */
export const deal = (
  drawCount: DrawCount = 1,
  random: () => number = Math.random
): GameState => {
  const deck = shuffle(createDeck(), random);
  const tableau = TABLEAU.map((_, column) =>
    deck
      .splice(0, column + 1)
      .map((card, i) => ({ ...card, faceUp: i === column }))
  );
  return {
    stock: deck,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    moves: 0,
    drawCount,
  };
};

/**
 * A click on the stock: turns 1 or 3 cards onto the waste. With the stock
 * empty, the waste goes back to it, face down, as many times as wanted.
 */
export const draw = (state: GameState): GameState => {
  if (state.stock.length === 0) {
    if (state.waste.length === 0) return state;
    return {
      ...state,
      stock: [...state.waste].reverse().map((c) => ({ ...c, faceUp: false })),
      waste: [],
      moves: state.moves + 1,
    };
  }
  const count = Math.min(state.drawCount, state.stock.length);
  const turned = state.stock
    .slice(-count)
    .reverse()
    .map((c) => ({ ...c, faceUp: true }));
  return {
    ...state,
    stock: state.stock.slice(0, -count),
    waste: [...state.waste, ...turned],
    moves: state.moves + 1,
  };
};

/**
 * The cards that would leave a pile if the card at `index` is picked up, or
 * null if it can't be picked up: only the top card of the waste and of a
 * foundation, and a face-up run (down by one, alternating colours) in a column.
 */
export const pickUp = (
  state: GameState,
  from: PileId,
  index: number
): Card[] | null => {
  const pile = getPile(state, from);
  const card = pile[index];
  if (!card?.faceUp || from === 'stock') return null;
  if (!isTableau(from)) return index === pile.length - 1 ? [card] : null;
  const run = pile.slice(index);
  const valid = run.every(
    (c, i) =>
      i === 0 ||
      (c.faceUp &&
        c.rank === run[i - 1].rank - 1 &&
        isRed(c) !== isRed(run[i - 1]))
  );
  return valid ? run : null;
};

/** Whether these cards can be dropped on that pile. */
export const canDrop = (state: GameState, cards: Card[], to: PileId) => {
  const first = cards[0];
  if (!first) return false;
  const top = last(getPile(state, to));
  if (isFoundation(to)) {
    if (cards.length !== 1) return false;
    return top
      ? top.suit === first.suit && first.rank === top.rank + 1
      : first.rank === 1;
  }
  if (isTableau(to)) {
    if (!top) return first.rank === 13;
    return (
      top.faceUp && isRed(top) !== isRed(first) && first.rank === top.rank - 1
    );
  }
  return false;
};

/**
 * Moves the card at `index` (and the ones on it) to another pile. Returns the
 * new state, or null when the move breaks the rules. A face-down card left on
 * top of a column turns face up by itself.
 */
export const move = (
  state: GameState,
  from: PileId,
  index: number,
  to: PileId
): GameState | null => {
  if (from === to) return null;
  const cards = pickUp(state, from, index);
  if (!cards || !canDrop(state, cards, to)) return null;
  const left = getPile(state, from).slice(0, index);
  const below = last(left);
  if (below && !below.faceUp)
    left[left.length - 1] = { ...below, faceUp: true };
  const next = withPile(state, from, left);
  return {
    ...withPile(next, to, [...getPile(next, to), ...cards]),
    moves: state.moves + 1,
  };
};

/** Where a single click sends a card, as a move, or null if nowhere. */
export interface AutoMove {
  from: PileId;
  index: number;
  to: PileId;
}

/**
 * The move a click on a card makes: a single card goes to a foundation if it
 * can; if not, the card (with the ones on it) goes to the first column that
 * takes it. Moves that change nothing, like a King already at the bottom of a
 * column going to an empty one, are skipped.
 */
export const findAutoMove = (
  state: GameState,
  from: PileId,
  index: number
): AutoMove | null => {
  const cards = pickUp(state, from, index);
  if (!cards) return null;
  if (cards.length === 1 && !isFoundation(from)) {
    const to = FOUNDATIONS.find((f) => canDrop(state, cards, f));
    if (to) return { from, index, to };
  }
  const to = TABLEAU.find(
    (t) =>
      t !== from &&
      canDrop(state, cards, t) &&
      !(index === 0 && isTableau(from) && getPile(state, t).length === 0)
  );
  return to ? { from, index, to } : null;
};

/**
 * The best click on a whole pile (for the keyboard): the top card to a
 * foundation, or else the longest run of the column that can go somewhere.
 */
export const findPileMove = (
  state: GameState,
  from: PileId
): AutoMove | null => {
  const pile = getPile(state, from);
  if (pile.length === 0) return null;
  const top = pile.length - 1;
  const toFoundation = findAutoMove(state, from, top);
  if (toFoundation && isFoundation(toFoundation.to)) return toFoundation;
  if (isTableau(from)) {
    const firstFaceUp = pile.findIndex((c) => c.faceUp);
    for (let i = firstFaceUp; i >= 0 && i < top; i++) {
      const found = findAutoMove(state, from, i);
      if (found) return found;
    }
  }
  return toFoundation;
};

export const isWon = (state: GameState) =>
  state.foundations.every((f) => f.length === 13);
