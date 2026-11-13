import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own Solitaire icon: two cards fanned out, a blue back behind and a
// red heart in front.
const GRID = [
  'KKKKKKK.........',
  'KBBBBBK.........',
  'KBWBWBKKKKKKKK..',
  'KBBBBBKWWWWWWWKD',
  'KBWBWKWRWWWWWWKD',
  'KBBBBKWWWWWWWWKD',
  'KBWBWKWWRRWRRWKD',
  'KBBBBKWRRRRRRRKD',
  'KBWBWKWRRRRRRRKD',
  'KBBBBKWWRRRRRWKD',
  'KBWBWKWWWRRRWWKD',
  'KBBBBKWWWWRWWWKD',
  'KKKKKKWWWWWWWWKD',
  '.....KWWWWWWRWKD',
  '.....KKKKKKKKKKD',
  '......DDDDDDDDDD',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  B: '#2a5bd7',
  R: '#d03a26',
};

export const SolitaireIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
