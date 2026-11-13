// The text variation selector keeps the suits as plain symbols (never emoji).
export const SUIT_SYMBOL = {
  spades: '♠︎',
  hearts: '♥︎',
  diamonds: '♦︎',
  clubs: '♣︎',
} as const;

const RANK_LABEL: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};
export const rankLabel = (rank: number) => RANK_LABEL[rank] ?? String(rank);

export const RED = '#c0141c';
