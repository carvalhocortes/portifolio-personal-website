import { memo } from 'react';
import { isRed, type Card } from '../model/cards';
import { rankLabel, RED, SUIT_SYMBOL } from './cardLabels';

const BLACK = '#111111';
const W = 70;
const H = 98;

const Corner = ({ card, color }: { card: Card; color: string }) => (
  <g fill={color} fontFamily="Georgia, 'Times New Roman', serif">
    <text x="7" y="15" fontSize="13" fontWeight="bold" textAnchor="middle">
      {rankLabel(card.rank)}
    </text>
    <text x="7" y="27" fontSize="11" textAnchor="middle">
      {SUIT_SYMBOL[card.suit]}
    </text>
  </g>
);

/** Our own card faces: corners, a big suit for numbers, a framed letter for faces. */
const Face = ({ card }: { card: Card }) => {
  const color = isRed(card) ? RED : BLACK;
  const isFace = card.rank > 10;
  return (
    <>
      <rect
        x="0.5"
        y="0.5"
        width={W - 1}
        height={H - 1}
        rx="5"
        fill="#fff"
        stroke="#000"
      />
      <Corner card={card} color={color} />
      <g transform={`rotate(180 ${W / 2} ${H / 2})`}>
        <Corner card={card} color={color} />
      </g>
      {isFace ? (
        <g>
          <rect
            x="16"
            y="16"
            width="38"
            height="66"
            rx="2"
            fill="#f4e6b8"
            stroke={color}
            strokeWidth="1.5"
          />
          <rect
            x="19"
            y="19"
            width="32"
            height="60"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
          />
          <text
            x="35"
            y="54"
            fontSize="28"
            fontWeight="bold"
            textAnchor="middle"
            fill={color}
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            {rankLabel(card.rank)}
          </text>
          <text x="35" y="72" fontSize="12" textAnchor="middle" fill={color}>
            {SUIT_SYMBOL[card.suit]}
          </text>
        </g>
      ) : (
        <text
          x="35"
          y={card.rank === 1 ? 63 : 60}
          fontSize={card.rank === 1 ? 40 : 30}
          textAnchor="middle"
          fill={color}
        >
          {SUIT_SYMBOL[card.suit]}
        </text>
      )}
    </>
  );
};

// A pane of the logo's flag: black frame, coloured glass.
const Pane = ({ x, color }: { x: number; color: string }) => (
  <g>
    <rect x={x} y="0" width="12" height="15" rx="1.5" fill="#111" />
    <rect x={x + 2.2} y="2.2" width="7.6" height="10.6" fill={color} />
  </g>
);

/** Card back: sky blue with the three-pane flag of the boot logo. */
const Back = () => (
  <>
    <rect
      x="0.5"
      y="0.5"
      width={W - 1}
      height={H - 1}
      rx="5"
      fill="#fff"
      stroke="#000"
    />
    <rect x="4" y="4" width={W - 8} height={H - 8} rx="3" fill="#4fb3f2" />
    <rect
      x="6.5"
      y="6.5"
      width={W - 13}
      height={H - 13}
      rx="2"
      fill="none"
      stroke="#fff"
      strokeOpacity="0.7"
    />
    <g fill="#fff" opacity="0.55">
      <ellipse cx="20" cy="22" rx="10" ry="4" />
      <ellipse cx="50" cy="78" rx="12" ry="4" />
      <ellipse cx="54" cy="20" rx="7" ry="3" />
    </g>
    <g transform="translate(19 41) skewY(-10)">
      <g fill="#f2b705">
        <rect x="-8" y="2" width="2.5" height="2.5" />
        <rect x="-5" y="9" width="2.5" height="2.5" />
      </g>
      <g fill="#2f9e2f">
        <rect x="-11" y="6" width="2.5" height="2.5" />
      </g>
      <g fill="#d03a26">
        <rect x="-6" y="13" width="2.5" height="2.5" />
      </g>
      <Pane x={0} color="#e4848c" />
      <Pane x={11} color="#53c28f" />
      <Pane x={22} color="#3d8fe0" />
    </g>
  </>
);

/** One card, face up or down, drawn in SVG. Decorative: the piles carry the names. */
export const CardFace = memo(({ card }: { card: Card }) => (
  <svg
    viewBox={`0 0 ${W} ${H}`}
    width="100%"
    height="100%"
    aria-hidden="true"
    focusable="false"
  >
    {card.faceUp ? <Face card={card} /> : <Back />}
  </svg>
));
CardFace.displayName = 'CardFace';
