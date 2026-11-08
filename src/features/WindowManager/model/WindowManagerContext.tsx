import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  getActiveWindowId,
  initialWindowState,
  windowReducer,
  type Size,
  type WindowManagerState,
} from './windowReducer';
import { WindowManagerContext, type WindowManagerApi } from './context';

const FALLBACK_TASKBAR = 32;

export const WindowManagerProvider: React.FC<{
  children: React.ReactNode;
  initialState?: WindowManagerState;
}> = ({ children, initialState = initialWindowState }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState);
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const viewport = useCallback((): Size => {
    const el = desktopRef.current;
    if (el && el.clientWidth > 0) {
      return { width: el.clientWidth, height: el.clientHeight };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight - FALLBACK_TASKBAR,
    };
  }, []);

  useEffect(() => {
    const onResize = () =>
      dispatch({ type: 'fitViewport', viewport: viewport() });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [viewport]);

  const api = useMemo<WindowManagerApi>(
    () => ({
      state,
      activeId: getActiveWindowId(state),
      desktopRef,
      open: (id, size, options) =>
        dispatch({
          type: 'open',
          id,
          size,
          viewport: viewport(),
          placement: options?.placement,
        }),
      focus: (id) => dispatch({ type: 'focus', id }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      toggleMaximize: (id) => dispatch({ type: 'toggleMaximize', id }),
      close: (id) => dispatch({ type: 'close', id }),
      move: (id, x, y) =>
        dispatch({ type: 'move', id, x, y, viewport: viewport() }),
      resize: (id, bounds, edges) =>
        dispatch({ type: 'resize', id, bounds, edges, viewport: viewport() }),
    }),
    [state, viewport]
  );

  return (
    <WindowManagerContext.Provider value={api}>
      {children}
    </WindowManagerContext.Provider>
  );
};
