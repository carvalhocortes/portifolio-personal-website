export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = (typeof SUITS)[number];

export interface Card {
  /** Unique in the deck, like "hearts-7". */
  id: string;
  suit: Suit;
  /** 1 (Ace) to 13 (King). */
  rank: number;
  faceUp: boolean;
}

export const isRed = (card: Pick<Card, 'suit'>) =>
  card.suit === 'hearts' || card.suit === 'diamonds';

/** The 52 cards, face down, in suit and rank order. */
export const createDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    Array.from({ length: 13 }, (_, i) => ({
      id: `${suit}-${i + 1}`,
      suit,
      rank: i + 1,
      faceUp: false,
    }))
  );

/**
 * Fisher-Yates shuffle into a new array. The random source can be swapped,
 * so tests get the same deal every time.
 */
export const shuffle = <T>(items: T[], random: () => number = Math.random) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** A small seeded random source (mulberry32), for repeatable deals in tests. */
export const seededRandom = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** The last item (the top card of a pile), if any. */
export const last = <T>(items: readonly T[]): T | undefined =>
  items[items.length - 1];
