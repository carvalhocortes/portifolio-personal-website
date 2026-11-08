import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own browser icon: it recalls the current Chrome (a round icon in red,
// yellow and green around a blue center) with a different drawing: straight
// pie wedges instead of the swirl, a square center and a pixel outline.
const GRID = [
  '.....KKKKKK.....',
  '...KKRRRRRRKK...',
  '..KRRRRRRRRRRK..',
  '.KRRRRRRRRRRRRK.',
  '.KGRRRRRRRRRRYK.',
  'KGGGRRWWWWRRYYYK',
  'KGGGGWBBBBWYYYYK',
  'KGGGGWBBBBWYYYYK',
  'KGGGGWBBBBWYYYYK',
  'KGGGGWBBBBWYYYYK',
  'KGGGGGWWWWYYYYYK',
  '.KGGGGGGYYYYYYK.',
  '.KGGGGGGYYYYYYK.',
  '..KGGGGGYYYYYK..',
  '...KKGGGYYYKK...',
  '.....KKKKKK.....',
] as const;

const PALETTE = {
  '.': null,
  K: '#1a1a1a',
  W: '#ffffff',
  R: '#d8453a',
  Y: '#f0b52b',
  G: '#2e9a55',
  B: '#3478e0',
};

export const ChromeIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
