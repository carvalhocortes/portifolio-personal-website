import React from 'react';
import { PixelIcon } from './PixelIcon';

// Same drawing as the site favicon: a CRT monitor showing a ">_" prompt.
const GRID = [
  'WWWWWWWWWWWWWWWK',
  'WLLLLLLLLLLLLLDK',
  'WLDDDDDDDDDDDLDK',
  'WLDSSSSSSSSSWLDK',
  'WLDSGGSSSSSSWLDK',
  'WLDSSGGSSSSSWLDK',
  'WLDSSSGGSSSSWLDK',
  'WLDSSGGSSSSSWLDK',
  'WLDSGGSSGGGGWLDK',
  'WLDSSSSSSSSSWLDK',
  'WLDWWWWWWWWWWLDK',
  'WLLLLLLLLLLLLLDK',
  'WDDDDDDDDDDDDDDK',
  'KKKKKWLLLLDKKKKK',
  '...WWLLLLLLDDK..',
  '...KKKKKKKKKKK..',
] as const;

const PALETTE = {
  '.': null,
  K: '#000000',
  W: '#ffffff',
  L: '#c0c0c0',
  D: '#808080',
  G: '#aaaaaa',
  S: '#000000',
};

export const MsDosIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <PixelIcon grid={GRID} palette={PALETTE} size={size} />
);
