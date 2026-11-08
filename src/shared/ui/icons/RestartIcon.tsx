import React from 'react';
import { PixelIcon } from './PixelIcon';

// Restart: a circular arrow in green.
const GRID = [
  '................',
  '.....GGGGGG.G...',
  '...GGG....GGG...',
  '..GG.......GG...',
  '.GG.....GGGGG...',
  '.GG.............',
  'GG..............',
  'GG..............',
  'GG..............',
  'GG............GG',
  '.GG..........GG.',
  '.GG..........GG.',
  '..GG........GG..',
  '...GGG....GGG...',
  '.....GGGGGG.....',
  '................',
] as const;

const PALETTE = { '.': null, G: '#2f9e2f' };

export const RestartIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
