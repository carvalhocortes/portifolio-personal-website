import { createContext, useContext, type RefObject } from 'react';

export interface LandingFrame {
  /** Where overlays (the photo viewer) render: the whole landing frame. */
  overlayHost: HTMLElement | null;
  /** The page content, made inert while an overlay is open. */
  contentRef: RefObject<HTMLDivElement | null>;
  /** True inside a desktop window: overlays cover only the window. */
  embedded: boolean;
}

export const LandingFrameContext = createContext<LandingFrame>({
  overlayHost: null,
  contentRef: { current: null },
  embedded: false,
});

export const useLandingFrame = () => useContext(LandingFrameContext);
