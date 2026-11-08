import { describe, expect, it } from 'vitest';
import {
  CASCADE_ORIGIN,
  CASCADE_STEP,
  MIN_WINDOW,
  clampBounds,
  getActiveWindowId,
  getTaskbarWindows,
  initialWindowState,
  windowReducer,
  type WindowManagerState,
} from './windowReducer';

const VIEWPORT = { width: 1024, height: 700 };
const SIZE = { width: 600, height: 400 };

const open = (state: WindowManagerState, id = 'terminal' as const) =>
  windowReducer(state, { type: 'open', id, size: SIZE, viewport: VIEWPORT });

describe('windowReducer', () => {
  it('opens a window at the cascade origin and makes it active', () => {
    const state = open(initialWindowState);
    expect(state.windows).toEqual([
      {
        id: 'terminal',
        x: CASCADE_ORIGIN.x,
        y: CASCADE_ORIGIN.y,
        ...SIZE,
        minimized: false,
        maximized: false,
        openOrder: 0,
      },
    ]);
    expect(getActiveWindowId(state)).toBe('terminal');
  });

  it('opens a centered window in the middle of the desktop, fitted to it', () => {
    const state = windowReducer(initialWindowState, {
      type: 'open',
      id: 'notepad',
      size: { width: 560, height: 440 },
      viewport: VIEWPORT,
      placement: 'center',
    });
    expect(state.windows[0]).toMatchObject({
      x: (VIEWPORT.width - 560) / 2,
      y: (VIEWPORT.height - 440) / 2,
      width: 560,
      height: 440,
    });

    const small = windowReducer(initialWindowState, {
      type: 'open',
      id: 'notepad',
      size: { width: 2000, height: 2000 },
      viewport: VIEWPORT,
      placement: 'center',
    });
    expect(small.windows[0].x).toBeGreaterThanOrEqual(0);
    expect(small.windows[0].width).toBeLessThan(VIEWPORT.width);
    expect(small.windows[0].height).toBeLessThan(VIEWPORT.height);
  });

  it('opens a window in the top-right corner, inside the desktop', () => {
    const state = windowReducer(initialWindowState, {
      type: 'open',
      id: 'clock',
      size: { width: 320, height: 340 },
      viewport: VIEWPORT,
      placement: 'top-right',
    });
    expect(state.windows[0]).toMatchObject({
      x: VIEWPORT.width - 320 - 8,
      y: 8,
      width: 320,
      height: 340,
    });
  });

  it('keeps the taskbar in opening order when the focus changes', () => {
    let state = windowReducer(initialWindowState, {
      type: 'open',
      id: 'browser',
      size: SIZE,
      viewport: VIEWPORT,
    });
    state = open(state);
    state = windowReducer(state, { type: 'focus', id: 'browser' });
    expect(state.windows.map((w) => w.id)).toEqual(['terminal', 'browser']);
    expect(getTaskbarWindows(state).map((w) => w.id)).toEqual([
      'browser',
      'terminal',
    ]);
  });

  it('opening an open window restores and focuses it instead of duplicating', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, { type: 'minimize', id: 'terminal' });
    expect(getActiveWindowId(state)).toBeNull();
    state = open(state);
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].minimized).toBe(false);
    expect(getActiveWindowId(state)).toBe('terminal');
  });

  it('cascades new windows', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, { type: 'close', id: 'terminal' });
    state = open(state);
    expect(state.windows[0].x).toBe(CASCADE_ORIGIN.x + CASCADE_STEP);
    expect(state.windows[0].y).toBe(CASCADE_ORIGIN.y + CASCADE_STEP);
  });

  it('shrinks windows that do not fit the desktop', () => {
    const state = windowReducer(initialWindowState, {
      type: 'open',
      id: 'terminal',
      size: { width: 2000, height: 2000 },
      viewport: VIEWPORT,
    });
    const [w] = state.windows;
    expect(w.width).toBeLessThanOrEqual(VIEWPORT.width);
    expect(w.height).toBeLessThanOrEqual(VIEWPORT.height);
    expect(w.x + w.width).toBeLessThanOrEqual(VIEWPORT.width);
    expect(w.y + w.height).toBeLessThanOrEqual(VIEWPORT.height);
  });

  it('toggles maximize and closes', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, { type: 'toggleMaximize', id: 'terminal' });
    expect(state.windows[0].maximized).toBe(true);
    state = windowReducer(state, { type: 'toggleMaximize', id: 'terminal' });
    expect(state.windows[0].maximized).toBe(false);
    state = windowReducer(state, { type: 'close', id: 'terminal' });
    expect(state.windows).toHaveLength(0);
  });

  it('keeps a moved window inside the desktop', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, {
      type: 'move',
      id: 'terminal',
      x: -100,
      y: 5000,
      viewport: VIEWPORT,
    });
    expect(state.windows[0].x).toBe(0);
    expect(state.windows[0].y).toBe(VIEWPORT.height - SIZE.height);
  });

  it('does not move or resize a maximized window', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, { type: 'toggleMaximize', id: 'terminal' });
    const before = state.windows[0];
    state = windowReducer(state, {
      type: 'move',
      id: 'terminal',
      x: 10,
      y: 10,
      viewport: VIEWPORT,
    });
    state = windowReducer(state, {
      type: 'resize',
      id: 'terminal',
      bounds: { x: 0, y: 0, width: 400, height: 300 },
      edges: { left: false, top: false },
      viewport: VIEWPORT,
    });
    expect(state.windows[0]).toEqual(before);
  });
});

describe('clampBounds (resize)', () => {
  it('grows from the bottom-right up to the desktop edge', () => {
    expect(
      clampBounds(
        { x: 100, y: 100, width: 5000, height: 5000 },
        { left: false, top: false },
        VIEWPORT
      )
    ).toEqual({ x: 100, y: 100, width: 924, height: 600 });
  });

  it('never gets smaller than the minimum size', () => {
    expect(
      clampBounds(
        { x: 100, y: 100, width: 10, height: 10 },
        { left: false, top: false },
        VIEWPORT
      )
    ).toEqual({ x: 100, y: 100, ...MIN_WINDOW });
  });

  it('keeps the right/bottom edge fixed when dragging the top-left corner', () => {
    const result = clampBounds(
      { x: -50, y: -50, width: 650, height: 450 },
      { left: true, top: true },
      VIEWPORT
    );
    expect(result).toEqual({ x: 0, y: 0, width: 600, height: 400 });
  });

  it('stops the left edge at the minimum width', () => {
    const result = clampBounds(
      { x: 500, y: 100, width: 100, height: 400 },
      { left: true, top: false },
      VIEWPORT
    );
    expect(result.width).toBe(MIN_WINDOW.width);
    expect(result.x + result.width).toBe(600);
  });
});

describe('fitViewport', () => {
  it('pulls windows back on screen when the browser gets smaller', () => {
    let state = open(initialWindowState);
    state = windowReducer(state, {
      type: 'move',
      id: 'terminal',
      x: 400,
      y: 290,
      viewport: VIEWPORT,
    });
    const small = { width: 500, height: 400 };
    state = windowReducer(state, { type: 'fitViewport', viewport: small });
    const [w] = state.windows;
    expect(w.x + w.width).toBeLessThanOrEqual(small.width);
    expect(w.y + w.height).toBeLessThanOrEqual(small.height);
    expect(w.width).toBeGreaterThanOrEqual(MIN_WINDOW.width);
  });
});
