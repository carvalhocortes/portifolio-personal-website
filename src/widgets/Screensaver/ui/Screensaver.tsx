import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../../shared/lib/reducedMotion';
import { StartLogo } from '../../../shared/ui/icons';
import styles from './Screensaver.module.css';

const STARS = 220;

/**
 * Our own starfield screensaver, drawn on a canvas. With reduced motion, a
 * dark screen with the still logo instead. Pure decoration.
 */
export const Screensaver = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const still = prefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (still || !canvas || !ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const spawn = () => ({
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * canvas.width,
    });
    const stars = Array.from({ length: STARS }, spawn);
    let frame = 0;
    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      stars.forEach((star, i) => {
        star.z -= 6;
        if (star.z <= 1) stars[i] = { ...spawn(), z: canvas.width };
        const k = 128 / star.z;
        const x = cx + star.x * k;
        const y = cy + star.y * k;
        const size = Math.max(0.5, 2.5 - star.z / (canvas.width / 2));
        ctx.fillRect(x, y, size, size);
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [still]);

  return (
    <div className={styles.saver} aria-hidden="true" data-testid="screensaver">
      {still ? (
        <div className={styles.still}>
          <StartLogo size={96} />
        </div>
      ) : (
        <canvas ref={canvasRef} className={styles.canvas} />
      )}
    </div>
  );
};
