import { useEffect, useRef } from 'react';
import { isRed, type Card } from '../model/cards';
import { rankLabel, RED, SUIT_SYMBOL } from './cardLabels';
import styles from './Solitaire.module.css';

interface Start {
  card: Card;
  x: number;
  y: number;
}

const GRAVITY = 0.5;
const BOUNCE = 0.75;
const LAUNCH_EVERY_MS = 350;

const drawCard = (
  ctx: CanvasRenderingContext2D,
  card: Card,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, w * 0.07);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isRed(card) ? RED : '#111';
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(w * 0.19)}px Georgia, serif`;
  ctx.fillText(rankLabel(card.rank), x + w * 0.11, y + w * 0.22);
  ctx.font = `${Math.round(w * 0.42)}px serif`;
  ctx.fillText(SUIT_SYMBOL[card.suit], x + w / 2, y + h * 0.62);
};

/**
 * The classic ending: the cards jump off the foundations one by one and
 * bounce across the table, leaving a trail. It stops by itself when the last
 * card leaves, and as soon as the window is closed or minimized.
 */
export const WinCascade = ({
  starts,
  cardWidth,
}: {
  starts: Start[];
  cardWidth: number;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext?.('2d');
    if (!el || !ctx) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const ratio = window.devicePixelRatio || 1;
    el.width = width * ratio;
    el.height = height * ratio;
    ctx.scale(ratio, ratio);
    const w = cardWidth;
    const h = cardWidth * 1.4;

    const flying: {
      card: Card;
      x: number;
      y: number;
      vx: number;
      vy: number;
    }[] = [];
    let next = 0;
    let lastLaunch = -Infinity;
    let frame = 0;

    const step = (time: number) => {
      // Hidden (window minimized or closed): stop for good.
      if (el.getClientRects().length === 0) return;
      if (next < starts.length && time - lastLaunch > LAUNCH_EVERY_MS) {
        const s = starts[next++];
        lastLaunch = time;
        const speed = 2 + Math.random() * 4;
        flying.push({
          ...s,
          vx: Math.random() < 0.5 ? -speed : speed,
          vy: -Math.random() * 6,
        });
      }
      for (const f of flying) {
        f.vy += GRAVITY;
        f.x += f.vx;
        f.y += f.vy;
        if (f.y + h > height) {
          f.y = height - h;
          f.vy = -f.vy * BOUNCE;
        }
        drawCard(ctx, f.card, f.x, f.y, w, h);
      }
      const gone = (f: (typeof flying)[number]) => f.x + w < 0 || f.x > width;
      for (let i = flying.length - 1; i >= 0; i--)
        if (gone(flying[i])) flying.splice(i, 1);
      if (next < starts.length || flying.length > 0)
        frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [starts, cardWidth]);

  return <canvas ref={canvas} className={styles.cascade} aria-hidden="true" />;
};
