import type { Level } from './levels';

export type CellState = 'hidden' | 'flagged' | 'revealed';

export interface Cell {
  mine: boolean;
  /** Mines in the 8 neighbours. */
  adjacent: number;
  state: CellState;
}

/** 'ready' until the first cell is opened; the clock starts with 'playing'. */
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

export interface Game {
  level: Level;
  /** Row by row: the cell at (row, col) is cells[row * cols + col]. */
  cells: readonly Cell[];
  status: GameStatus;
  /** False until the mines are placed (on the first opened cell). */
  minesPlaced: boolean;
  flags: number;
  /** The mine that went off, when lost. */
  exploded: number | null;
}

export type Random = () => number;

/** Indexes of the up to 8 cells around one. */
export const neighbours = (level: Level, index: number): number[] => {
  const row = Math.floor(index / level.cols);
  const col = index % level.cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < level.rows && c >= 0 && c < level.cols) {
        result.push(r * level.cols + c);
      }
    }
  }
  return result;
};

const withMines = (level: Level, mines: Iterable<number>): Cell[] => {
  const isMine = new Set(mines);
  return Array.from({ length: level.cols * level.rows }, (_, i) => ({
    mine: isMine.has(i),
    adjacent: neighbours(level, i).filter((n) => isMine.has(n)).length,
    state: 'hidden' as const,
  }));
};

/**
 * A new game. Mines are placed on the first opened cell, unless the tests
 * pass fixed ones.
 */
export const createGame = (level: Level, mines?: Iterable<number>): Game => ({
  level,
  cells: withMines(level, mines ?? []),
  status: 'ready',
  minesPlaced: mines !== undefined,
  flags: 0,
  exploded: null,
});

/**
 * Picks the mines anywhere except the first cell and, when there is room,
 * its neighbours, so the first click always opens an area.
 */
const placeMines = (game: Game, first: number, random: Random): Game => {
  const { level } = game;
  const total = level.cols * level.rows;
  const around = new Set([first, ...neighbours(level, first)]);
  const safe = total - around.size >= level.mines ? around : new Set([first]);
  const candidates = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !safe.has(i)
  );
  // Partial Fisher-Yates: the first `mines` candidates end up shuffled.
  for (let i = 0; i < level.mines; i++) {
    const j = i + Math.floor(random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return {
    ...game,
    cells: withMines(level, candidates.slice(0, level.mines)),
    minesPlaced: true,
  };
};

const finish = (game: Game, cells: Cell[]): Game => {
  const won = cells.every((cell) => cell.mine || cell.state === 'revealed');
  if (!won) return { ...game, cells, status: 'playing' };
  // Won: the mines left get their flags, like the classic.
  return {
    ...game,
    status: 'won',
    flags: game.level.mines,
    cells: cells.map((cell) =>
      cell.mine && cell.state !== 'flagged'
        ? { ...cell, state: 'flagged' }
        : cell
    ),
  };
};

/**
 * Opens cells. Empty ones (no mines around) open their neighbours too, with
 * a queue so the big board can't overflow the stack. A mine loses the game.
 */
const open = (game: Game, indexes: number[]): Game => {
  const cells = [...game.cells];
  const queue = indexes.filter((i) => cells[i].state === 'hidden');
  const hitMine = queue.find((i) => cells[i].mine);
  if (hitMine !== undefined) {
    return {
      ...game,
      cells: cells.map((cell, i) =>
        i === hitMine ? { ...cell, state: 'revealed' } : cell
      ),
      status: 'lost',
      exploded: hitMine,
    };
  }
  while (queue.length > 0) {
    const i = queue.shift()!;
    if (cells[i].state !== 'hidden') continue;
    cells[i] = { ...cells[i], state: 'revealed' };
    if (cells[i].adjacent === 0) {
      queue.push(
        ...neighbours(game.level, i).filter(
          (n) => cells[n].state === 'hidden' && !cells[n].mine
        )
      );
    }
  }
  return finish(game, cells);
};

const isOver = (game: Game) => game.status === 'won' || game.status === 'lost';

/**
 * Opens a cell. On an open number whose flags around already match, opens
 * the other neighbours (the "chord"). Flagged cells don't open.
 */
export const reveal = (
  game: Game,
  index: number,
  random: Random = Math.random
): Game => {
  if (isOver(game)) return game;
  const cell = game.cells[index];
  if (cell.state === 'flagged') return game;
  if (cell.state === 'revealed') return chord(game, index);
  const ready = game.minesPlaced ? game : placeMines(game, index, random);
  return open(ready, [index]);
};

/** On an open number with the right flags around, opens the rest around it. */
export const chord = (game: Game, index: number): Game => {
  if (isOver(game)) return game;
  const cell = game.cells[index];
  if (cell.state !== 'revealed' || cell.adjacent === 0) return game;
  const around = neighbours(game.level, index);
  const flagged = around.filter((n) => game.cells[n].state === 'flagged');
  if (flagged.length !== cell.adjacent) return game;
  return open(game, around);
};

/** Puts or takes a flag on a closed cell. The count may go past the mines. */
export const toggleFlag = (game: Game, index: number): Game => {
  if (isOver(game)) return game;
  const cell = game.cells[index];
  if (cell.state === 'revealed') return game;
  const flagged = cell.state === 'hidden';
  const cells = [...game.cells];
  cells[index] = { ...cell, state: flagged ? 'flagged' : 'hidden' };
  return { ...game, cells, flags: game.flags + (flagged ? 1 : -1) };
};

/** Mines left for the counter: may go negative with too many flags. */
export const minesLeft = (game: Game) => game.level.mines - game.flags;
