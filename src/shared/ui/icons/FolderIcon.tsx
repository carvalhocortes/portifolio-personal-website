import React from 'react';
import { PixelIcon } from './PixelIcon';

// A yellow file folder, for folders inside the Recycle Bin.
const GRID = [
  '................',
  '................',
  '..KKKKK.........',
  '.KYYYYYK........',
  '.KYYYYYYKKKKKKK.',
  '.KYWWWWWWWWWWYKD',
  '.KYWYYYYYYYYYYKD',
  '.KYYYYYYYYYYYYKD',
  '.KYYYYYYYYYYYYKD',
  '.KYYYYYYYYYYYYKD',
  '.KYYYYYYYYYYYYKD',
  '.KYYYYYYYYYYYYKD',
  '.KKKKKKKKKKKKKKD',
  '..DDDDDDDDDDDDDD',
  '................',
  '................',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  D: '#808080',
  Y: '#f2d86b',
};

export const FolderIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
