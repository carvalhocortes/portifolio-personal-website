import { createContext, type RefObject } from 'react';
import type { ProgramId } from '../../../entities/Program/model/types';
import type {
  Bounds,
  ResizeEdges,
  Size,
  Placement,
  WindowManagerState,
} from './windowReducer';

export interface WindowManagerApi {
  state: WindowManagerState;
  activeId: ProgramId | null;
  open: (
    id: ProgramId,
    size: Size,
    options?: { placement?: Placement }
  ) => void;
  focus: (id: ProgramId) => void;
  minimize: (id: ProgramId) => void;
  toggleMaximize: (id: ProgramId) => void;
  close: (id: ProgramId) => void;
  move: (id: ProgramId, x: number, y: number) => void;
  resize: (id: ProgramId, bounds: Bounds, edges: ResizeEdges) => void;
  /** Sets the window's outer size, keeping it on screen. */
  setSize: (id: ProgramId, size: Size) => void;
  /** The element windows live in; its size is the movement limit. */
  desktopRef: RefObject<HTMLDivElement | null>;
}

export const WindowManagerContext = createContext<WindowManagerApi | null>(
  null
);
