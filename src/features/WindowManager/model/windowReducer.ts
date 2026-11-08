import type { ProgramId } from '../../../entities/Program/model/types';

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: ProgramId;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  /** When it was opened; the taskbar keeps this order, whatever has focus. */
  openOrder: number;
}

/** Where a window first appears on the desktop. */
export type Placement = 'cascade' | 'center' | 'top-right';

export interface WindowManagerState {
  /** Stacking order: the last window is on top. */
  windows: WindowState[];
  /** How many windows were opened, for the cascade offset. */
  opened: number;
}

export type WindowAction =
  | {
      type: 'open';
      id: ProgramId;
      size: Size;
      viewport: Size;
      /** Where it first appears; the cascade if not set. */
      placement?: Placement;
    }
  | { type: 'focus'; id: ProgramId }
  | { type: 'minimize'; id: ProgramId }
  | { type: 'toggleMaximize'; id: ProgramId }
  | { type: 'close'; id: ProgramId }
  | { type: 'move'; id: ProgramId; x: number; y: number; viewport: Size }
  | { type: 'fitViewport'; viewport: Size }
  | {
      type: 'resize';
      id: ProgramId;
      bounds: Bounds;
      edges: ResizeEdges;
      viewport: Size;
    };

/** Which edges the visitor is dragging (right/bottom when false). */
export interface ResizeEdges {
  left: boolean;
  top: boolean;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CASCADE_ORIGIN = { x: 120, y: 16 };
export const CASCADE_STEP = 24;
const CASCADE_LENGTH = 8;
const MARGIN = 8;
/** Smallest window the visitor can resize to. */
export const MIN_WINDOW: Size = { width: 320, height: 200 };

export const initialWindowState: WindowManagerState = {
  windows: [],
  opened: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/** Keeps the whole window inside the desktop (or at the top-left if it is bigger). */
export const clampPosition = (
  x: number,
  y: number,
  size: Size,
  viewport: Size
) => ({
  x: clamp(x, 0, viewport.width - size.width),
  y: clamp(y, 0, viewport.height - size.height),
});

const fitSize = (size: Size, viewport: Size): Size => ({
  width: Math.min(size.width, viewport.width - 2 * MARGIN),
  height: Math.min(size.height, viewport.height - 2 * MARGIN),
});

const bringToFront = (windows: WindowState[], id: ProgramId) => {
  const target = windows.find((w) => w.id === id);
  return target
    ? [...windows.filter((w) => w.id !== id), { ...target, minimized: false }]
    : windows;
};

const update = (
  windows: WindowState[],
  id: ProgramId,
  patch: (w: WindowState) => Partial<WindowState>
) => windows.map((w) => (w.id === id ? { ...w, ...patch(w) } : w));

export const windowReducer = (
  state: WindowManagerState,
  action: WindowAction
): WindowManagerState => {
  switch (action.type) {
    case 'open': {
      if (state.windows.some((w) => w.id === action.id)) {
        return { ...state, windows: bringToFront(state.windows, action.id) };
      }
      if (action.placement === 'center' || action.placement === 'top-right') {
        const size = fitSize(action.size, action.viewport);
        const position = clampPosition(
          action.placement === 'center'
            ? Math.round((action.viewport.width - size.width) / 2)
            : action.viewport.width - size.width - MARGIN,
          action.placement === 'center'
            ? Math.round((action.viewport.height - size.height) / 2)
            : MARGIN,
          size,
          action.viewport
        );
        const window: WindowState = {
          id: action.id,
          ...position,
          ...size,
          minimized: false,
          maximized: false,
          openOrder: state.opened,
        };
        return {
          windows: [...state.windows, window],
          opened: state.opened + 1,
        };
      }
      const step = (state.opened % CASCADE_LENGTH) * CASCADE_STEP;
      const desired = {
        x: CASCADE_ORIGIN.x + step,
        y: CASCADE_ORIGIN.y + step,
      };
      // Prefer shrinking the window so it opens right of the desktop icons;
      // only on very small desktops does it cover them.
      const besideIcons = {
        width: Math.min(
          action.size.width,
          action.viewport.width - desired.x - MARGIN
        ),
        height: Math.min(
          action.size.height,
          action.viewport.height - desired.y - MARGIN
        ),
      };
      const size =
        besideIcons.width >= MIN_WINDOW.width &&
        besideIcons.height >= MIN_WINDOW.height
          ? besideIcons
          : fitSize(action.size, action.viewport);
      const position = clampPosition(
        desired.x,
        desired.y,
        size,
        action.viewport
      );
      const window: WindowState = {
        id: action.id,
        ...position,
        ...size,
        minimized: false,
        maximized: false,
        openOrder: state.opened,
      };
      return { windows: [...state.windows, window], opened: state.opened + 1 };
    }
    case 'focus':
      return { ...state, windows: bringToFront(state.windows, action.id) };
    case 'minimize':
      return {
        ...state,
        windows: update(state.windows, action.id, () => ({ minimized: true })),
      };
    case 'toggleMaximize':
      return {
        ...state,
        windows: bringToFront(
          update(state.windows, action.id, (w) => ({
            maximized: !w.maximized,
          })),
          action.id
        ),
      };
    case 'close':
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
      };
    case 'move':
      return {
        ...state,
        windows: update(state.windows, action.id, (w) =>
          w.maximized
            ? {}
            : clampPosition(action.x, action.y, w, action.viewport)
        ),
      };
    case 'fitViewport':
      // The browser got smaller: shrink and pull windows back on screen.
      return {
        ...state,
        windows: state.windows.map((w) => {
          const size = fitSize(
            {
              width: Math.max(w.width, MIN_WINDOW.width),
              height: Math.max(w.height, MIN_WINDOW.height),
            },
            action.viewport
          );
          return {
            ...w,
            ...size,
            ...clampPosition(w.x, w.y, size, action.viewport),
          };
        }),
      };
    case 'resize':
      return {
        ...state,
        windows: update(state.windows, action.id, (w) =>
          w.maximized
            ? {}
            : clampBounds(action.bounds, action.edges, action.viewport)
        ),
      };
    default:
      return state;
  }
};

/**
 * Keeps resized bounds inside the desktop and at least MIN_WINDOW big. When
 * the left/top edge is dragged, the opposite edge stays fixed.
 */
export const clampBounds = (
  bounds: Bounds,
  edges: ResizeEdges,
  viewport: Size
): Bounds => {
  let { x, y, width, height } = bounds;

  if (edges.left) {
    const right = x + width;
    x = clamp(x, 0, right - MIN_WINDOW.width);
    width = right - x;
  } else {
    width = clamp(width, MIN_WINDOW.width, viewport.width - x);
  }

  if (edges.top) {
    const bottom = y + height;
    y = clamp(y, 0, bottom - MIN_WINDOW.height);
    height = bottom - y;
  } else {
    height = clamp(height, MIN_WINDOW.height, viewport.height - y);
  }

  return { x, y, width, height };
};

/** The front-most window that is not minimized, if any. */
export const getActiveWindowId = (state: WindowManagerState) =>
  [...state.windows].reverse().find((w) => !w.minimized)?.id ?? null;

/** Windows in the order they were opened, for the taskbar. */
export const getTaskbarWindows = (state: WindowManagerState) =>
  [...state.windows].sort((a, b) => a.openOrder - b.openOrder);
