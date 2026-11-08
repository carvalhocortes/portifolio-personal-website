import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own Recycle Bin icon: a wire basket with crumpled papers inside.
const GRID = [
  '................',
  '....WW..WWW.....',
  '...WWWWWWWWW....',
  '..KKKKKKKKKKKK..',
  '..KLDLDLDLDLDK..',
  '..KDLDLDLDLDLK..',
  '...KLDLDLDLDK...',
  '...KDLDLDLDLK...',
  '...KLDLDLDLDK...',
  '...KDLDLDLDLK...',
  '....KLDLDLDK....',
  '....KDLDLDLK....',
  '....KLDLDLDK....',
  '....KKKKKKKK....',
  '.....DDDDDDDD...',
  '................',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  L: '#c0c0c0',
};

export const RecycleBinIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
