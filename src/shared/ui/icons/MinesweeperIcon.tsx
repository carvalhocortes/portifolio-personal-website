import React from 'react';
import { PixelIcon } from './PixelIcon';

// Our own Minesweeper icon: a raised board cell with a mine on it.
const GRID = [
  'WWWWWWWWWWWWWWWD',
  'WLLLLLLLLLLLLLDD',
  'WLLLLLLKLLLLLLDD',
  'WLLKLKKKKKLKLLDD',
  'WLLLKKKKKKKLLLDD',
  'WLLKKWWKKKKKLLDD',
  'WLLKKWWKKKKKLLDD',
  'WLKKKKKKKKKKKLDD',
  'WLLKKKKKKKKKLLDD',
  'WLLKKKKKKKKKLLDD',
  'WLLLKKKKKKKLLLDD',
  'WLLKLKKKKKLKLLDD',
  'WLLLLLLKLLLLLLDD',
  'WLLLLLLLLLLLLLDD',
  'WDDDDDDDDDDDDDDD',
  'DDDDDDDDDDDDDDDD',
] as const;

const PALETTE = {
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  L: '#c0c0c0',
};

export const MinesweeperIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
