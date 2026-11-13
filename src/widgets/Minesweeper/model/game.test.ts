import { describe, expect, it } from 'vitest';
import {
  chord,
  createGame,
  minesLeft,
  neighbours,
  reveal,
  toggleFlag,
  type Game,
} from './game';
import { LEVELS, type Level } from './levels';

// A 4 × 4 board for hand-made cases:
//   0  1  2  3
//   4  5  6  7
//   8  9 10 11
//  12 13 14 15
const SMALL: Level = { id: 'beginner', cols: 4, rows: 4, mines: 2 };
const at = (row: number, col: number) => row * SMALL.cols + col;
const revealed = (game: Game) =>
  game.cells.flatMap((c, i) => (c.state === 'revealed' ? [i] : []));

describe('neighbours', () => {
  it('has 3 in a corner, 5 on an edge and 8 inside', () => {
    expect(neighbours(SMALL, at(0, 0)).sort((a, b) => a - b)).toEqual([
      1, 4, 5,
    ]);
    expect(neighbours(SMALL, at(0, 1))).toHaveLength(5);
    expect(neighbours(SMALL, at(1, 1))).toHaveLength(8);
  });
});

describe('createGame', () => {
  it('counts the mines around each cell', () => {
    const game = createGame(SMALL, [at(0, 0), at(0, 2)]);
    expect(game.cells[at(0, 1)].adjacent).toBe(2);
    expect(game.cells[at(1, 1)].adjacent).toBe(2);
    expect(game.cells[at(1, 3)].adjacent).toBe(1);
    expect(game.cells[at(3, 3)].adjacent).toBe(0);
    expect(game.status).toBe('ready');
    expect(minesLeft(game)).toBe(2);
  });
});

describe('first click', () => {
  it('is never a mine and opens an area, on every level', () => {
    for (const level of Object.values(LEVELS)) {
      for (let seed = 0; seed < 20; seed++) {
        let s = seed + 1;
        // A small repeatable random generator.
        const random = () => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
        const first = Math.floor((level.cols * level.rows) / 2);
        const game = reveal(createGame(level), first, random);
        expect(game.status).not.toBe('lost');
        expect(game.cells.filter((c) => c.mine)).toHaveLength(level.mines);
        expect(game.cells[first].adjacent).toBe(0);
        for (const n of neighbours(level, first)) {
          expect(game.cells[n].mine).toBe(false);
        }
      }
    }
  });

  it('starts the game', () => {
    const game = reveal(createGame(LEVELS.beginner), 40);
    expect(game.status).toBe('playing');
  });
});

describe('reveal', () => {
  it('opens just a number', () => {
    const game = reveal(createGame(SMALL, [at(0, 0), at(0, 2)]), at(0, 1));
    expect(revealed(game)).toEqual([at(0, 1)]);
  });

  it('opens the area around an empty cell, up to the numbers', () => {
    const game = reveal(createGame(SMALL, [at(0, 0), at(0, 2)]), at(3, 3));
    // Rows 2 and 3 are empty; row 1 has the numbers that stop the area.
    expect(revealed(game)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + SMALL.cols)
    );
  });

  it('does not open a flagged cell', () => {
    const flagged = toggleFlag(createGame(SMALL, [at(0, 0)]), at(3, 3));
    expect(reveal(flagged, at(3, 3))).toBe(flagged);
  });

  it('loses on a mine, and nothing changes after that', () => {
    const game = reveal(createGame(SMALL, [at(0, 0), at(0, 2)]), at(0, 0));
    expect(game.status).toBe('lost');
    expect(game.exploded).toBe(at(0, 0));
    expect(reveal(game, at(3, 3))).toBe(game);
    expect(toggleFlag(game, at(3, 3))).toBe(game);
  });

  it('wins when every free cell is open, and flags the mines', () => {
    let game = createGame(SMALL, [at(0, 0), at(0, 2)]);
    game = reveal(game, at(3, 3));
    game = reveal(game, at(0, 1));
    expect(game.status).toBe('playing');
    game = reveal(game, at(0, 3));
    expect(game.status).toBe('won');
    expect(game.cells[at(0, 0)].state).toBe('flagged');
    expect(game.cells[at(0, 2)].state).toBe('flagged');
    expect(minesLeft(game)).toBe(0);
  });
});

describe('toggleFlag', () => {
  it('puts and takes a flag, and the counter follows', () => {
    let game = createGame(SMALL, [at(0, 0), at(0, 2)]);
    game = toggleFlag(game, at(3, 3));
    expect(game.cells[at(3, 3)].state).toBe('flagged');
    expect(minesLeft(game)).toBe(1);
    game = toggleFlag(game, at(3, 3));
    expect(game.cells[at(3, 3)].state).toBe('hidden');
    expect(minesLeft(game)).toBe(2);
  });

  it('lets the counter go negative', () => {
    let game = createGame(SMALL, [at(0, 0), at(0, 2)]);
    for (const i of [1, 3, 5]) game = toggleFlag(game, i);
    expect(minesLeft(game)).toBe(-1);
  });

  it('does nothing on an open cell', () => {
    const game = reveal(createGame(SMALL, [at(0, 0), at(0, 2)]), at(0, 1));
    expect(toggleFlag(game, at(0, 1))).toBe(game);
  });
});

describe('chord', () => {
  const start = () =>
    // (1,1) shows 2: the mines are (0,0) and (0,2).
    reveal(createGame(SMALL, [at(0, 0), at(0, 2)]), at(1, 1));

  it('opens the neighbours when the flags match the number', () => {
    let game = start();
    game = toggleFlag(game, at(0, 0));
    game = toggleFlag(game, at(0, 2));
    game = chord(game, at(1, 1));
    expect(game.cells[at(0, 1)].state).toBe('revealed');
    expect(game.cells[at(2, 2)].state).toBe('revealed');
  });

  it('also works by clicking the open number', () => {
    let game = start();
    game = toggleFlag(game, at(0, 0));
    game = toggleFlag(game, at(0, 2));
    game = reveal(game, at(1, 1));
    expect(game.cells[at(0, 1)].state).toBe('revealed');
  });

  it('does nothing with fewer flags than the number', () => {
    const game = toggleFlag(start(), at(0, 0));
    expect(chord(game, at(1, 1))).toBe(game);
  });

  it('loses when a flag is in the wrong place', () => {
    let game = start();
    game = toggleFlag(game, at(0, 0));
    game = toggleFlag(game, at(0, 1));
    game = chord(game, at(1, 1));
    expect(game.status).toBe('lost');
    expect(game.exploded).toBe(at(0, 2));
  });
});
