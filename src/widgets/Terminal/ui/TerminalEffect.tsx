import { useEffect, useRef, useState } from 'react';
import { hackLines, type TerminalEffect as Effect } from '../commands/secrets';
import styles from './TerminalEffect.module.css';

export const MATRIX_MS = 5000;
const HACK_LINE_MS = 450;

interface TerminalEffectProps {
  effect: Effect;
  onDone: () => void;
}

/**
 * An effect played over the terminal for a few seconds: green characters
 * falling (`matrix`) or film-style hacking lines (`hackear`). A click or a key
 * ends it early. Decoration only: screen readers get the final text instead.
 */
export const TerminalEffect = ({ effect, onDone }: TerminalEffectProps) => {
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    // React may mount the effect while the Enter that ran the command is
    // still bubbling up to the window: that key must not end it right away.
    const startedAt = performance.now();
    const end = (e: KeyboardEvent) => {
      if (e.timeStamp > startedAt) doneRef.current();
    };
    window.addEventListener('keydown', end);
    return () => window.removeEventListener('keydown', end);
  }, []);

  return (
    <div
      className={styles.overlay}
      aria-hidden="true"
      data-testid="terminal-effect"
      data-effect={effect}
      onClick={(e) => {
        e.stopPropagation();
        onDone();
      }}
    >
      {effect === 'matrix' ? (
        <MatrixRain onDone={() => doneRef.current()} />
      ) : (
        <HackLines onDone={() => doneRef.current()} />
      )}
    </div>
  );
};

const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>/{}';

const MatrixRain = ({ onDone }: { onDone: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(onDone, MATRIX_MS);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !ctx) return () => window.clearTimeout(timer);

    const size = 16;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const drops = Array.from(
      { length: Math.ceil(canvas.width / size) },
      () => Math.random() * -20
    );
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#33ff66';
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(glyph, i * size, y * size);
        drops[i] = y * size > canvas.height && Math.random() > 0.97 ? 0 : y + 1;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
    // Runs once: onDone is read through a stable wrapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

const HackLines = ({ onDone }: { onDone: () => void }) => {
  const lines = hackLines();
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown > lines.length) {
      const timer = window.setTimeout(onDone, HACK_LINE_MS * 2);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setShown((n) => n + 1), HACK_LINE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  const progress = Math.min(1, shown / lines.length);
  const filled = Math.round(progress * 24);
  return (
    <div className={styles.hack}>
      {lines.slice(0, shown).map((line) => (
        <p key={line}>&gt; {line}</p>
      ))}
      <p className={styles.bar}>
        [{'#'.repeat(filled)}
        {'.'.repeat(24 - filled)}] {Math.round(progress * 100)}%
      </p>
    </div>
  );
};
