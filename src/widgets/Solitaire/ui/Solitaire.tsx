import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import { prefersReducedMotion } from '../../../shared/lib/reducedMotion';
import { last, type Card } from '../model/cards';
import {
  canDrop,
  findAutoMove,
  findPileMove,
  FOUNDATIONS,
  getPile,
  isFoundation,
  isTableau,
  pileIndex,
  pickUp,
  TABLEAU,
  type AutoMove,
  type GameState,
  type PileId,
} from '../model/game';
import { useSolitaire } from '../model/useSolitaire';
import { CardFace } from './CardFace';
import { MenuBar } from './MenuBar';
import { WinCascade } from './WinCascade';
import styles from './Solitaire.module.css';

const PADDING = 8;
const MIN_CARD = 40;
const MAX_CARD = 100;
// A drag shorter than this is a click.
const DRAG_THRESHOLD = 5;

interface Drag {
  from: PileId;
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  active: boolean;
  rect: DOMRect;
  /** The grabbed card and the ones on it. */
  cards: HTMLElement[];
}

const overlap = (a: DOMRect, b: DOMRect) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Card width from the table width: seven columns and their gaps fit side by side.
const useCardWidth = (table: React.RefObject<HTMLDivElement | null>) => {
  const [width, setWidth] = useState(72);
  useLayoutEffect(() => {
    const el = table.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const free = entry.contentRect.width - PADDING * 2;
      // Seven cards and six gaps of 15 % of a card.
      const fit = Math.floor(free / (7 + 6 * 0.15));
      setWidth(Math.max(MIN_CARD, Math.min(MAX_CARD, fit)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [table]);
  return width;
};

/**
 * Solitaire (Klondike): drag the cards, or click one for the automatic move.
 * Each pile is a button with its cards in the name, so the game also works
 * with the keyboard and a screen reader.
 */
export const Solitaire = ({ onClose }: ProgramProps) => {
  const { t } = useTranslation();
  const solitaire = useSolitaire();
  const { game, won } = solitaire;
  const table = useRef<HTMLDivElement>(null);
  const cardWidth = useCardWidth(table);
  const cardHeight = Math.round(cardWidth * 1.4);
  const gap = Math.round(cardWidth * 0.15);
  const piles = useRef(new Map<PileId, HTMLDivElement>());
  // The drag lives outside React state: the cards follow the pointer through
  // their transform, without rendering the table again on every move.
  const dragRef = useRef<Drag | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const justDragged = useRef(false);
  const [announcement, setAnnouncement] = useState('');
  const [help, setHelp] = useState(false);

  const cardName = (card: Card) =>
    t('solitaire.card', {
      rank: [1, 11, 12, 13].includes(card.rank)
        ? t(`solitaire.ranks.${card.rank}`)
        : String(card.rank),
      suit: t(`solitaire.suits.${card.suit}`),
    });

  const pileLabel = (state: GameState, id: PileId): string => {
    const pile = getPile(state, id);
    const top = last(pile);
    if (id === 'stock') {
      if (pile.length) return t('solitaire.stock', { count: pile.length });
      return state.waste.length
        ? t('solitaire.stockRecycle')
        : t('solitaire.stockEmpty');
    }
    if (id === 'waste')
      return top
        ? t('solitaire.waste', { card: cardName(top) })
        : t('solitaire.wasteEmpty');
    const n = pileIndex(id) + 1;
    if (isFoundation(id))
      return top
        ? t('solitaire.foundation', { n, card: cardName(top) })
        : t('solitaire.foundationEmpty', { n });
    if (!top) return t('solitaire.columnEmpty', { n });
    const hidden = pile.filter((c) => !c.faceUp).length;
    const cards = [
      ...(hidden ? [t('solitaire.hidden', { count: hidden })] : []),
      ...pile.filter((c) => c.faceUp).map(cardName),
    ].join(', ');
    return t('solitaire.column', { n, cards });
  };

  const play = (m: AutoMove) => {
    const card = getPile(game, m.from)[m.index];
    solitaire.move(m.from, m.index, m.to);
    setAnnouncement(
      isFoundation(m.to)
        ? t('solitaire.toFoundation', { card: cardName(card) })
        : t('solitaire.toColumn', {
            card: cardName(card),
            n: pileIndex(m.to) + 1,
          })
    );
  };

  const tryAutoMove = (found: AutoMove | null) => {
    if (found) play(found);
    else setAnnouncement(t('solitaire.noMove'));
  };

  // Keyboard (and screen reader clicks on a pile): the best move of the pile.
  const activatePile = (id: PileId) => {
    if (won) return;
    if (id === 'stock') return solitaire.draw();
    tryAutoMove(findPileMove(game, id));
  };

  const onCardPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    from: PileId,
    index: number
  ) => {
    // A new press starts fresh, even on a card that can't be picked up.
    justDragged.current = false;
    if (e.button !== 0 || won || !pickUp(game, from, index)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pileEl = piles.current.get(from);
    dragRef.current = {
      from,
      index,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      active: false,
      rect: e.currentTarget.getBoundingClientRect(),
      cards: Array.from(
        pileEl?.querySelectorAll<HTMLElement>('[data-index]') ?? []
      ).filter((el) => Number(el.dataset.index) >= index),
    };
  };

  // Puts the dragged cards back in their places.
  const release = (current: Drag) => {
    for (const el of current.cards) {
      el.style.transform = '';
      delete el.dataset.dragging;
    }
  };

  const onCardPointerMove = (e: React.PointerEvent) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    const dx = e.clientX - current.startX;
    const dy = e.clientY - current.startY;
    if (!current.active && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    Object.assign(current, { dx, dy, active: true });
    for (const el of current.cards) {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.dataset.dragging = '';
    }
  };

  // A cancelled gesture (taken over by the system) never makes a move.
  const onCardPointerCancel = (e: React.PointerEvent) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    dragRef.current = null;
    release(current);
  };

  const onCardPointerUp = (e: React.PointerEvent) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== e.pointerId) return;
    dragRef.current = null;
    release(current);
    if (!current.active) return;
    justDragged.current = true;
    // Dropped on the pile the dragged card overlaps the most, if it fits there.
    const cards = pickUp(game, current.from, current.index);
    const moved = new DOMRect(
      current.rect.x + current.dx,
      current.rect.y + current.dy,
      current.rect.width,
      current.rect.height
    );
    let best: { to: PileId; area: number } | null = null;
    for (const [id, el] of piles.current) {
      if (id === current.from || !cards || !canDrop(game, cards, id)) continue;
      const area = overlap(moved, el.getBoundingClientRect());
      if (area > 0 && (!best || area > best.area)) best = { to: id, area };
    }
    if (best) play({ from: current.from, index: current.index, to: best.to });
  };

  const onCardClick = (e: React.MouseEvent, from: PileId, index: number) => {
    e.stopPropagation();
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    if (won) return;
    if (from === 'stock') return solitaire.draw();
    if (pickUp(game, from, index)) tryAutoMove(findAutoMove(game, from, index));
  };

  // Where each card of a pile sits, from the top left of the pile.
  const offsets = (id: PileId, pile: Card[]) => {
    if (isTableau(id)) {
      let top = 0;
      return pile.map((card) => {
        const at = top;
        top += Math.round(cardHeight * (card.faceUp ? 0.24 : 0.1));
        return { left: 0, top: at };
      });
    }
    // The waste shows the last three cards fanned out in draw-3 mode.
    const fan = id === 'waste' && game.drawCount === 3 ? 3 : 1;
    return pile.map((_, i) => ({
      left: Math.max(0, i - (pile.length - fan)) * Math.round(cardWidth * 0.22),
      top: 0,
    }));
  };

  const renderPile = (id: PileId) => {
    const pile = getPile(game, id);
    const places = offsets(id, pile);
    const height = isTableau(id)
      ? (last(places)?.top ?? 0) + cardHeight
      : cardHeight;
    // Only the top cards of the side piles are drawn; the rest lie under them.
    const firstShown = isTableau(id) ? 0 : Math.max(0, pile.length - 4);
    return (
      <div
        key={id}
        ref={(el) => {
          if (el) piles.current.set(id, el);
          else piles.current.delete(id);
        }}
        role="button"
        tabIndex={0}
        aria-label={pileLabel(game, id)}
        aria-disabled={won || undefined}
        data-pile={id}
        className={`${styles.pile} ${id === 'stock' ? styles.stock : ''}`}
        style={{ height }}
        onClick={() => activatePile(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activatePile(id);
          }
        }}
      >
        {pile.length === 0 && (
          <div className={styles.placeholder} aria-hidden="true">
            {id === 'stock' && game.waste.length > 0 ? '↻' : ''}
          </div>
        )}
        {pile.map((card, i) => {
          if (i < firstShown) return null;
          const style = {
            left: places[i].left,
            top: places[i].top,
            '--i': i,
          } as React.CSSProperties;
          return (
            <div
              key={card.id}
              className={`${styles.card} ${card.faceUp && id !== 'stock' ? styles.movable : ''}`}
              style={style}
              data-card={card.id}
              data-index={i}
              onPointerDown={(e) => onCardPointerDown(e, id, i)}
              onPointerMove={onCardPointerMove}
              onPointerUp={onCardPointerUp}
              onPointerCancel={onCardPointerCancel}
              onClick={(e) => onCardClick(e, id, i)}
            >
              <CardFace card={card} />
            </div>
          );
        })}
      </div>
    );
  };

  // The cards fly off the foundations from the Kings down.
  const [cascade, setCascade] = useState<
    { card: Card; x: number; y: number }[] | null
  >(null);
  useEffect(() => {
    if (!won) {
      setCascade(null);
      return;
    }
    if (prefersReducedMotion() || !wrap.current) return;
    // From the visible area: the canvas covers it, not the scrolled table.
    const origin = wrap.current.getBoundingClientRect();
    const starts = [];
    for (let rank = 13; rank >= 1; rank--) {
      for (const id of FOUNDATIONS) {
        const box = piles.current.get(id)?.getBoundingClientRect();
        const card = getPile(game, id).find((c) => c.rank === rank);
        if (box && card) {
          starts.push({
            card,
            x: box.left - origin.left,
            y: box.top - origin.top,
          });
        }
      }
    }
    setCascade(starts);
  }, [won, game]);

  // When a dialog closes, the focus goes back to the table (the stock), not
  // to the page behind the window.
  const backToTable = () => piles.current.get('stock')?.focus();
  const closeHelp = () => {
    setHelp(false);
    backToTable();
  };
  const playAgain = () => {
    solitaire.newGame();
    backToTable();
  };

  const menus = [
    {
      label: t('solitaire.game'),
      items: [
        { label: t('solitaire.newGame'), onSelect: () => solitaire.newGame() },
        {
          label: t('solitaire.undo'),
          onSelect: solitaire.undo,
          disabled: !solitaire.canUndo,
        },
        {
          label: t('solitaire.draw1'),
          onSelect: () => solitaire.setDrawCount(1),
          checked: game.drawCount === 1,
          separator: true,
        },
        {
          label: t('solitaire.draw3'),
          onSelect: () => solitaire.setDrawCount(3),
          checked: game.drawCount === 3,
        },
        ...(onClose
          ? [{ label: t('solitaire.exit'), onSelect: onClose, separator: true }]
          : []),
      ],
    },
    {
      label: t('solitaire.help'),
      items: [{ label: t('solitaire.howTo'), onSelect: () => setHelp(true) }],
    },
  ];

  return (
    <div className={styles.solitaire}>
      <MenuBar label={t('solitaire.menuBar')} menus={menus} />
      <div ref={wrap} className={styles.tableWrap}>
        <div
          ref={table}
          className={styles.table}
          role="group"
          aria-label={t('solitaire.table')}
          style={
            {
              '--card-w': `${cardWidth}px`,
              '--card-h': `${cardHeight}px`,
              '--gap': `${gap}px`,
            } as React.CSSProperties
          }
        >
          <div className={styles.row}>
            {renderPile('stock')}
            {renderPile('waste')}
            <div aria-hidden="true" />
            {FOUNDATIONS.map(renderPile)}
          </div>
          <div className={styles.row}>{TABLEAU.map(renderPile)}</div>
        </div>
        {cascade && <WinCascade starts={cascade} cardWidth={cardWidth} />}
      </div>
      <div className={styles.status}>
        <span>
          {t('solitaire.time', { time: formatTime(solitaire.seconds) })}
        </span>
        <span>{t('solitaire.moves', { count: game.moves })}</span>
      </div>
      <div className={styles.srOnly} aria-live="polite">
        {announcement}
      </div>
      {won && (
        <div className={styles.dialogLayer}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-labelledby="solitaire-won"
          >
            <h3 id="solitaire-won">{t('solitaire.won')}</h3>
            <p>
              {t('solitaire.wonDetails', {
                time: formatTime(solitaire.seconds),
                count: game.moves,
              })}
            </p>
            <button
              type="button"
              className={styles.button}
              autoFocus
              onClick={playAgain}
            >
              {t('solitaire.playAgain')}
            </button>
          </div>
        </div>
      )}
      {help && (
        <div className={styles.dialogLayer}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="solitaire-help"
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeHelp();
              // OK is the only control: Tab stays on it, inside the dialog.
              if (e.key === 'Tab') e.preventDefault();
            }}
          >
            <h3 id="solitaire-help">{t('solitaire.howTo')}</h3>
            {t('solitaire.rules')
              .split('\n')
              .map((line) => (
                <p key={line}>{line}</p>
              ))}
            <button
              type="button"
              className={styles.button}
              autoFocus
              onClick={closeHelp}
            >
              {t('solitaire.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
