import { memo } from 'react';
import { PixelIcon } from '../../../shared/ui/icons';
import { formatCounter } from '../model/counter';

// Our own pixel art for the board: a round mine with spikes and a flag on a
// stand. Both 13 × 13, drawn at 13 px inside the 24 px cells.
const MINE = [
  '......K......',
  '......K......',
  '..K.KKKKK.K..',
  '...KKKKKKK...',
  '..KKWWKKKKK..',
  '..KKWWKKKKK..',
  'KKKKKKKKKKKKK',
  '..KKKKKKKKK..',
  '..KKKKKKKKK..',
  '...KKKKKKK...',
  '..K.KKKKK.K..',
  '......K......',
  '......K......',
] as const;

const FLAG = [
  '.............',
  '....RRK......',
  '..RRRRK......',
  '.RRRRRK......',
  '..RRRRK......',
  '....RRK......',
  '......K......',
  '......K......',
  '......K......',
  '....KKKKK....',
  '..KKKKKKKKK..',
  '.............',
  '.............',
] as const;

const PALETTE = { K: '#000000', W: '#ffffff', R: '#e00000' };

export const MineGlyph = () => (
  <PixelIcon grid={MINE} palette={PALETTE} size={13} />
);

export const FlagGlyph = () => (
  <PixelIcon grid={FLAG} palette={PALETTE} size={13} />
);

export type FaceMood = 'smile' | 'oh' | 'cool' | 'dead';

/** The new-game button face, drawn as a small SVG. */
export const Face = memo(({ mood }: { mood: FaceMood }) => (
  <svg
    viewBox="0 0 17 17"
    width="17"
    height="17"
    aria-hidden="true"
    focusable="false"
    data-mood={mood}
  >
    <circle
      cx="8.5"
      cy="8.5"
      r="7.5"
      fill="#ffff00"
      stroke="#000"
      strokeWidth="1"
    />
    {mood === 'cool' ? (
      <path d="M3 6h11v1l-1 2h-3l-1-2h-1l-1 2H4L3 7z" fill="#000" />
    ) : mood === 'dead' ? (
      <path
        d="M4.5 5l2 2m0-2l-2 2M10.5 5l2 2m0-2l-2 2"
        stroke="#000"
        strokeWidth="1"
      />
    ) : (
      <g fill="#000">
        <rect x="5" y="5" width="2" height="2" />
        <rect x="10" y="5" width="2" height="2" />
      </g>
    )}
    {mood === 'oh' ? (
      <circle cx="8.5" cy="11.5" r="1.5" fill="none" stroke="#000" />
    ) : mood === 'dead' ? (
      <path d="M5 13q3.5-3 7 0" fill="none" stroke="#000" />
    ) : (
      <path d="M5 10.5q3.5 3 7 0" fill="none" stroke="#000" />
    )}
  </svg>
));

Face.displayName = 'Face';

// Seven-segment digits: which of the segments a-g are on.
const SEGMENTS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abdeg',
  '3': 'abcdg',
  '4': 'bcfg',
  '5': 'acdfg',
  '6': 'acdefg',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
};

const SHAPES: Record<string, string> = {
  a: 'M2 1h7l-1 2H3z',
  b: 'M10 2v8l-2-1V4z',
  c: 'M10 12v8l-2-2v-5z',
  d: 'M2 21h7l-1-2H3z',
  e: 'M1 12v8l2-2v-5z',
  f: 'M1 2v8l2-1V4z',
  g: 'M2 11l1-1h5l1 1-1 1H3z',
};

const Digit = ({ char }: { char: string }) => (
  <svg viewBox="0 0 11 22" width="13" height="23" aria-hidden="true">
    {Object.entries(SHAPES).map(([segment, d]) => (
      <path
        key={segment}
        d={d}
        fill={SEGMENTS[char]?.includes(segment) ? '#ff0000' : '#400000'}
      />
    ))}
  </svg>
);

export const Counter = ({ value, label }: { value: number; label: string }) => (
  <div role="img" aria-label={label} data-value={formatCounter(value)}>
    {[...formatCounter(value)].map((char, i) => (
      <Digit key={i} char={char} />
    ))}
  </div>
);
