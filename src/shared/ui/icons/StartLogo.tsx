import React from 'react';
import { PixelIcon } from './PixelIcon';

// Original logo for the Start button: a four-colour flag waving on a pole.
// It nods to the 1995 look without copying any real logo.
const GRID = [
  'KK..............',
  'KK.RRRR.GGGG....',
  'KKRRRRRRGGGGGG..',
  'KKRRRRRRGGGGGGG.',
  'KKRRRRRRGGGGGGG.',
  'KK.RRRRR.GGGGGG.',
  'KK..............',
  'KK.BBBB.YYYY....',
  'KKBBBBBBYYYYYY..',
  'KKBBBBBBYYYYYYY.',
  'KKBBBBBBYYYYYYY.',
  'KK.BBBBB.YYYYYY.',
  'KK..............',
  'KK..............',
  'KK..............',
  'KK..............',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  R: '#d03a26',
  G: '#2f9e2f',
  B: '#2a5bd7',
  Y: '#f2b705',
};

export const StartLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
