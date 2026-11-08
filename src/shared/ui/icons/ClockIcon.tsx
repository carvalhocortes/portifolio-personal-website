import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own Clock icon: a round grey clock face with teal hands.
const GRID = [
  '.....KKKKKK.....',
  '...KKWWWWWWKK...',
  '..KWWWWKWWWWWK..',
  '.KWWWWWKWWWWWWK.',
  '.KWWWWWTWWWWWWKD',
  'KWWWWWWTWWWWWWWK',
  'KWWWWWWTWWWWWWWK',
  'KWKWWWWTTTTTWKWK',
  'KWWWWWWWWWWWWWWK',
  'KWWWWWWWWWWWWWWK',
  '.KWWWWWWWWWWWWKD',
  '.KWWWWWWWWWWWWKD',
  '..KWWWWWKWWWWKD.',
  '...KKWWWWWWKKD..',
  '.....KKKKKKDD...',
  '......DDDDD.....',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  T: '#008080',
};

export const ClockIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
