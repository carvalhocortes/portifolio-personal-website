import React from 'react';
import { PixelIcon } from './PixelIcon';

// A text document with a folded corner, for .txt files.
const GRID = [
  '..KKKKKKKKK.....',
  '..KWWWWWWWKK....',
  '..KWWWWWWWKWK...',
  '..KWBBBBWWKKKK..',
  '..KWWWWWWWWWWKD.',
  '..KWBBBBBBBBWKD.',
  '..KWWWWWWWWWWKD.',
  '..KWBBBBBBBWWKD.',
  '..KWWWWWWWWWWKD.',
  '..KWBBBBBBBBWKD.',
  '..KWWWWWWWWWWKD.',
  '..KWBBBBBWWWWKD.',
  '..KWWWWWWWWWWKD.',
  '..KKKKKKKKKKKKD.',
  '...DDDDDDDDDDDD.',
  '................',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  B: '#5a6fa8',
};

export const TextFileIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
