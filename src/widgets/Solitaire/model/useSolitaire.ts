import { useCallback, useEffect, useReducer } from 'react';
import { readStored, writeStored } from '../../../shared/lib/storage';
import { last } from './cards';
import {
  deal,
  draw,
  isWon,
  move,
  type DrawCount,
  type GameState,
  type PileId,
} from './game';

export const DRAW_COUNT_KEY = 'cc84.solitaireDraw';
// Enough undo for a whole game, without growing forever.
const MAX_HISTORY = 500;

// The last draw mode the visitor picked; 1 card the first time.
const savedDrawCount = (): DrawCount =>
  readStored(DRAW_COUNT_KEY) === '3' ? 3 : 1;

interface Session {
  game: GameState;
  history: GameState[];
  /** Seconds played; the clock starts with the first move. */
  seconds: number;
}

type Action =
  | { type: 'new'; game: GameState }
  | { type: 'draw' }
  | { type: 'move'; from: PileId; index: number; to: PileId }
  | { type: 'undo' }
  | { type: 'tick' };

const play = (session: Session, next: GameState | null): Session =>
  next && next !== session.game
    ? {
        ...session,
        game: next,
        history: [...session.history, session.game].slice(-MAX_HISTORY),
      }
    : session;

const reducer = (session: Session, action: Action): Session => {
  switch (action.type) {
    case 'new':
      // Shuffled outside the reducer, which must stay pure.
      return { game: action.game, history: [], seconds: 0 };
    case 'draw':
      return play(session, draw(session.game));
    case 'move':
      return play(
        session,
        move(session.game, action.from, action.index, action.to)
      );
    case 'undo': {
      const previous = last(session.history);
      return previous
        ? { ...session, game: previous, history: session.history.slice(0, -1) }
        : session;
    }
    case 'tick':
      return { ...session, seconds: session.seconds + 1 };
  }
};

/**
 * One game of Solitaire: the cards, the moves, Undo, the clock and the
 * 1-or-3 draw mode (remembered in the browser; changing it deals again).
 */
export const useSolitaire = (initial?: GameState, random?: () => number) => {
  const [session, dispatch] = useReducer(reducer, undefined, () => ({
    game: initial ?? deal(savedDrawCount(), random),
    history: [],
    seconds: 0,
  }));
  const { game } = session;
  const won = isWon(game);
  const running = game.moves > 0 && !won;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const newGame = useCallback(
    (drawCount: DrawCount = game.drawCount) =>
      dispatch({ type: 'new', game: deal(drawCount, random) }),
    [game.drawCount, random]
  );

  // Picking the mode already in use keeps the game; a new one deals again.
  const setDrawCount = useCallback(
    (drawCount: DrawCount) => {
      if (drawCount === game.drawCount) return;
      writeStored(DRAW_COUNT_KEY, String(drawCount));
      dispatch({ type: 'new', game: deal(drawCount, random) });
    },
    [game.drawCount, random]
  );

  return {
    game,
    seconds: session.seconds,
    won,
    canUndo: session.history.length > 0 && !won,
    newGame,
    setDrawCount,
    draw: useCallback(() => dispatch({ type: 'draw' }), []),
    move: useCallback(
      (from: PileId, index: number, to: PileId) =>
        dispatch({ type: 'move', from, index, to }),
      []
    ),
    undo: useCallback(() => dispatch({ type: 'undo' }), []),
  };
};
