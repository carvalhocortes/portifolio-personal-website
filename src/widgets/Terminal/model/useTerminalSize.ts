import { useEffect, useState, type RefObject } from 'react';
import {
  useScreenSize,
  type ScreenSize,
} from '../../../shared/lib/useScreenSize';

/** Width of one character of the 8x16 DOS font, in px. */
export const CHAR_WIDTH = 8;
/** Columns needed by the big and the medium welcome banners. */
export const XLARGE_COLUMNS = 89;
export const MEDIUM_COLUMNS = 66;

export const sizeForColumns = (columns: number): ScreenSize => {
  if (columns >= XLARGE_COLUMNS) return 'xlarge';
  if (columns >= MEDIUM_COLUMNS) return 'medium';
  return 'small';
};

/**
 * Size class of the terminal itself (not of the screen): inside a window the
 * terminal can be much narrower than the browser. Falls back to the screen
 * size where ResizeObserver is not available.
 */
export const useTerminalSize = (
  ref: RefObject<HTMLElement | null>
): ScreenSize => {
  const screenSize = useScreenSize();
  const [size, setSize] = useState<ScreenSize | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const style = getComputedStyle(el);
      const padding =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const columns = Math.floor((el.clientWidth - padding) / CHAR_WIDTH);
      if (columns > 0) setSize(sizeForColumns(columns));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size ?? screenSize;
};
