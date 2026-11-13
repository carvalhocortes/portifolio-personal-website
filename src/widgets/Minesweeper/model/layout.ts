import type { Level } from './levels';

// Sizes in px, matching Minesweeper.module.css.
export const CELL = 24;
const MENU = 20;
const PANEL_PADDING = 6;
const BOARD_BORDER = 3;
const HEADER = 40;
const HEADER_GAP = 6;

/** The space the game needs inside the window frame, for one level. */
export const contentSize = (level: Level) => ({
  width: level.cols * CELL + 2 * BOARD_BORDER + 2 * PANEL_PADDING,
  height:
    MENU +
    2 * PANEL_PADDING +
    HEADER +
    HEADER_GAP +
    level.rows * CELL +
    2 * BOARD_BORDER,
});
