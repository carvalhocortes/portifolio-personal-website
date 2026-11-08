import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own Notepad icon: a spiral notebook with lines of text.
const GRID = [
  '..D.D.D.D.D.D...',
  '.KDKDKDKDKDKDK..',
  '.KWWWWWWWWWWWK..',
  '.KWWWWWWWWWWWKD.',
  '.KWBBBBBBBBWWKD.',
  '.KWWWWWWWWWWWKD.',
  '.KWBBBBBBBWWWKD.',
  '.KWWWWWWWWWWWKD.',
  '.KWBBBBBBBBBWKD.',
  '.KWWWWWWWWWWWKD.',
  '.KWBBBBBWWWWWKD.',
  '.KWWWWWWWWWWWKD.',
  '.KWBBBBBBBBWWKD.',
  '.KWWWWWWWWWWWKD.',
  '.KKKKKKKKKKKKKD.',
  '..DDDDDDDDDDDDD.',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  B: '#5a6fa8',
};

export const NotepadIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
