import React from 'react';
import { PixelIcon } from './PixelIcon';

// Shut down: the power symbol in red.
const GRID = [
  '................',
  '.......RR.......',
  '.......RR.......',
  '...RR..RR..RR...',
  '..RR...RR...RR..',
  '.RR....RR....RR.',
  '.RR....RR....RR.',
  '.RR....RR....RR.',
  '.RR..........RR.',
  '.RR..........RR.',
  '..RR........RR..',
  '..RRR......RRR..',
  '...RRRR..RRRR...',
  '.....RRRRRR.....',
  '................',
  '................',
] as const;

const PALETTE = { '.': null, R: '#d03a26' };

export const PowerIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
