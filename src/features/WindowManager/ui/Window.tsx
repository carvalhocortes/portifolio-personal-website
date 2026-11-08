import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { WindowState } from '../model/windowReducer';
import { useWindowManager } from '../model/useWindowManager';
import styles from './Window.module.css';

interface WindowProps {
  window: WindowState;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
}

interface DragStart {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

type Direction = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const DIRECTIONS: Direction[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

interface ResizeStart {
  pointerId: number;
  direction: Direction;
  startX: number;
  startY: number;
  rect: { x: number; y: number; width: number; height: number };
}

/* Title bar glyphs drawn as pixel art so they stay crisp. */
const Glyph: React.FC<{ d: string }> = ({ d }) => (
  <svg
    viewBox="0 0 8 7"
    width="8"
    height="7"
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} fill="currentColor" />
  </svg>
);

const MINIMIZE = 'M1 5h6v2H1z';
const MAXIMIZE = 'M0 0h8v7H0zM1 2v4h6V2z';
const RESTORE = 'M2 0h6v5H6v2H0V2h2zM3 1v1h3v2h1V1zM1 3v3h4V3z';
const CLOSE =
  'M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0z';

export const Window: React.FC<WindowProps> = ({
  window: win,
  title,
  icon,
  isActive,
  children,
}) => {
  const { t } = useTranslation();
  const { focus, minimize, toggleMaximize, close, move, resize } =
    useWindowManager();
  const drag = useRef<DragStart | null>(null);
  const resizing = useRef<ResizeStart | null>(null);

  const onResizePointerDown =
    (direction: Direction) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (win.maximized || e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      resizing.current = {
        pointerId: e.pointerId,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        rect: { x: win.x, y: win.y, width: win.width, height: win.height },
      };
    };

  const onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = resizing.current;
    if (!start || start.pointerId !== e.pointerId) return;
    const dx = e.clientX - start.startX;
    const dy = e.clientY - start.startY;
    const { direction, rect } = start;
    const left = direction.includes('w');
    const top = direction.includes('n');
    const right = direction.includes('e');
    const bottom = direction.includes('s');

    resize(
      win.id,
      {
        x: left ? rect.x + dx : rect.x,
        y: top ? rect.y + dy : rect.y,
        width: rect.width + (right ? dx : left ? -dx : 0),
        height: rect.height + (bottom ? dy : top ? -dy : 0),
      },
      { left, top }
    );
  };

  const endResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizing.current?.pointerId !== e.pointerId) return;
    resizing.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const titleId = `window-title-${win.id}`;

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.maximized || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - win.x,
      offsetY: e.clientY - win.y,
    };
  };

  const onTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start || start.pointerId !== e.pointerId) return;
    move(win.id, e.clientX - start.offsetX, e.clientY - start.offsetY);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const frameStyle: React.CSSProperties = win.maximized
    ? {}
    : { left: win.x, top: win.y, width: win.width, height: win.height };

  return (
    <section
      className={[
        styles.window,
        win.maximized ? styles.maximized : '',
        win.minimized ? styles.minimized : '',
      ].join(' ')}
      style={frameStyle}
      aria-labelledby={titleId}
      data-active={isActive}
      hidden={win.minimized}
      onPointerDownCapture={() => {
        if (!isActive) focus(win.id);
      }}
    >
      <div
        className={`${styles.titleBar} ${isActive ? '' : styles.inactive}`}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('button'))
            toggleMaximize(win.id);
        }}
      >
        <span className={styles.titleIcon}>{icon}</span>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            aria-label={t('window.minimize')}
            title={t('window.minimize')}
            onClick={() => minimize(win.id)}
          >
            <Glyph d={MINIMIZE} />
          </button>
          <button
            type="button"
            className={styles.control}
            aria-label={
              win.maximized ? t('window.restore') : t('window.maximize')
            }
            title={win.maximized ? t('window.restore') : t('window.maximize')}
            onClick={() => toggleMaximize(win.id)}
          >
            <Glyph d={win.maximized ? RESTORE : MAXIMIZE} />
          </button>
          <button
            type="button"
            className={`${styles.control} ${styles.closeControl}`}
            aria-label={t('window.close')}
            title={t('window.close')}
            onClick={() => close(win.id)}
          >
            <Glyph d={CLOSE} />
          </button>
        </div>
      </div>
      <div className={styles.body}>{children}</div>
      {!win.maximized &&
        DIRECTIONS.map((direction) => (
          <div
            key={direction}
            className={`${styles.handle} ${styles[`handle-${direction}`]}`}
            data-resize={direction}
            aria-hidden="true"
            onPointerDown={onResizePointerDown(direction)}
            onPointerMove={onResizePointerMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        ))}
    </section>
  );
};
