import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { ProgramProps } from '../../../entities/Program/model/types';
import {
  createGame,
  minesLeft,
  reveal,
  toggleFlag,
  type Game,
} from '../model/game';
import { contentSize } from '../model/layout';
import { LEVEL_IDS, LEVELS, type LevelId } from '../model/levels';
import {
  loadLevel,
  loadRecords,
  saveLevel,
  saveRecords,
} from '../model/storage';
import { Counter, Face, FlagGlyph, MineGlyph, type FaceMood } from './glyphs';
import styles from './Minesweeper.module.css';

/** What a cell shows: a number is the count of mines around it. */
type CellView =
  'hidden' | 'flag' | 'wrongFlag' | 'mine' | 'exploded' | 'empty' | number;

const viewOf = (game: Game, index: number): CellView => {
  const cell = game.cells[index];
  const lost = game.status === 'lost';
  if (cell.state === 'revealed') {
    if (cell.mine) return index === game.exploded ? 'exploded' : 'mine';
    return cell.adjacent > 0 ? cell.adjacent : 'empty';
  }
  if (cell.state === 'flagged')
    return lost && !cell.mine ? 'wrongFlag' : 'flag';
  return lost && cell.mine ? 'mine' : 'hidden';
};

const isOpen = (view: CellView) =>
  view !== 'hidden' && view !== 'flag' && view !== 'wrongFlag';

interface CellProps {
  t: TFunction;
  index: number;
  row: number;
  col: number;
  view: CellView;
  focusable: boolean;
}

const BoardCell = memo(({ t, index, row, col, view, focusable }: CellProps) => {
  const label =
    typeof view === 'number'
      ? t('minesweeper.cell.number', { row, col, count: view })
      : t(`minesweeper.cell.${view}`, { row, col });
  return (
    <div
      role="gridcell"
      data-index={index}
      data-view={view}
      tabIndex={focusable ? 0 : -1}
      aria-label={label}
      className={[
        styles.cell,
        isOpen(view) ? styles.open : '',
        view === 'exploded' ? styles.exploded : '',
        typeof view === 'number' ? styles[`n${view}`] : '',
      ].join(' ')}
    >
      {typeof view === 'number' ? (
        <span aria-hidden="true">{view}</span>
      ) : view === 'flag' ? (
        <FlagGlyph />
      ) : view === 'wrongFlag' ? (
        <span className={styles.wrong}>
          <MineGlyph />
        </span>
      ) : view === 'mine' || view === 'exploded' ? (
        <MineGlyph />
      ) : null}
    </div>
  );
});

BoardCell.displayName = 'BoardCell';

const MAX_TIME = 999;

/** Seconds on the clock: the classic shows 1 as soon as the game starts. */
const secondsBetween = (start: number, end: number) =>
  Math.min(MAX_TIME, Math.floor((end - start) / 1000) + 1);

/**
 * The game clock, on its own so its ticks don't re-render the board. It runs
 * from `startedAt` until `stoppedAt`.
 */
const GameTimer = ({
  startedAt,
  stoppedAt,
}: {
  startedAt: number | null;
  stoppedAt: number | null;
}) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null || stoppedAt !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, stoppedAt]);
  const time =
    startedAt === null
      ? 0
      : secondsBetween(startedAt, stoppedAt ?? Math.max(now, startedAt));
  return (
    <Counter value={time} label={t('minesweeper.time', { count: time })} />
  );
};

/**
 * Minesweeper: open every cell without a mine. A 90s look with our own
 * drawings; the menu picks one of the three classic levels.
 */
export const Minesweeper = ({ onFitContent }: ProgramProps) => {
  const { t } = useTranslation();
  const [levelId, setLevelId] = useState<LevelId>(loadLevel);
  const level = LEVELS[levelId];
  const [game, setGame] = useState(() => createGame(LEVELS[levelId]));
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [records, setRecords] = useState(loadRecords);
  const [pressing, setPressing] = useState(false);
  const [focused, setFocused] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [newRecord, setNewRecord] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const recordsTitleId = useId();

  // The window opens at the beginner size; another saved level refits it.
  useEffect(() => {
    if (levelId !== 'beginner') onFitContent?.(contentSize(LEVELS[levelId]));
    // Only when the window opens: level changes fit it in changeLevel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (next: Game) => {
    if (next === game) return;
    const now = Date.now();
    const start = game.status === 'ready' ? now : (startedAt ?? now);
    if (game.status === 'ready' && next.status !== 'ready') setStartedAt(now);
    setGame(next);
    if (next.status === 'won' || next.status === 'lost') setStoppedAt(now);
    if (next.status === 'won') {
      const elapsed = secondsBetween(start, now);
      const best = records[levelId];
      if (best === undefined || elapsed < best) {
        const updated = { ...records, [levelId]: elapsed };
        setRecords(updated);
        saveRecords(updated);
        setNewRecord(true);
        setAnnouncement(t('minesweeper.newRecord', { count: elapsed }));
      } else {
        setAnnouncement(t('minesweeper.won', { count: elapsed }));
      }
    } else if (next.status === 'lost') {
      setAnnouncement(t('minesweeper.lost'));
    }
  };

  const newGame = (id: LevelId = levelId) => {
    setGame(createGame(LEVELS[id]));
    setStartedAt(null);
    setStoppedAt(null);
    setAnnouncement('');
    setNewRecord(false);
    setFocused(0);
  };

  const changeLevel = (id: LevelId) => {
    setLevelId(id);
    saveLevel(id);
    newGame(id);
    onFitContent?.(contentSize(LEVELS[id]));
  };

  // Clicks on the board are handled once, on the grid, for all cells.
  const cellIndex = (e: React.SyntheticEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    return el ? Number(el.dataset.index) : null;
  };

  const onBoardClick = (e: React.MouseEvent) => {
    const index = cellIndex(e);
    // On a Mac, Ctrl+click is the right click: the context menu flags it.
    if (index === null || e.ctrlKey) return;
    setFocused(index);
    apply(reveal(game, index));
  };

  const onBoardContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const index = cellIndex(e);
    if (index === null) return;
    setFocused(index);
    apply(toggleFlag(game, index));
  };

  const moveFocus = (index: number) => {
    setFocused(index);
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.focus();
  };

  const onBoardKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const row = Math.floor(focused / level.cols);
    const col = focused % level.cols;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      const r = Math.min(level.rows - 1, Math.max(0, row + move[0]));
      const c = Math.min(level.cols - 1, Math.max(0, col + move[1]));
      moveFocus(r * level.cols + c);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      apply(reveal(game, focused));
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      apply(toggleFlag(game, focused));
    }
  };

  const over = game.status === 'won' || game.status === 'lost';
  const mood: FaceMood =
    game.status === 'lost'
      ? 'dead'
      : game.status === 'won'
        ? 'cool'
        : pressing
          ? 'oh'
          : 'smile';

  // Menu: opens on the button, closes with Esc, a pick or a click outside.
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = [
      ...(menuRef.current?.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]'
      ) ?? []),
    ];
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(current + step + items.length) % items.length]?.focus();
    } else if (e.key === 'Tab') {
      setMenuOpen(false);
    }
  };

  const pick = (action: () => void) => () => {
    closeMenu();
    action();
  };

  const closeRecords = () => {
    setShowRecords(false);
    menuButtonRef.current?.focus();
  };

  return (
    <div className={styles.minesweeper}>
      <div className={styles.menuBar} inert={showRecords}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {t('minesweeper.menu.game')}
        </button>
        {menuOpen && (
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={t('minesweeper.menu.game')}
            className={styles.menu}
            onKeyDown={onMenuKeyDown}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={pick(() => newGame())}
              >
                {t('minesweeper.menu.new')}
              </button>
            </li>
            <li role="separator" className={styles.separator} />
            {LEVEL_IDS.map((id) => (
              <li role="none" key={id}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={id === levelId}
                  tabIndex={-1}
                  onClick={pick(() => changeLevel(id))}
                >
                  <span className={styles.check} aria-hidden="true">
                    {id === levelId ? '✓' : ''}
                  </span>
                  {t(`minesweeper.levels.${id}`)}
                </button>
              </li>
            ))}
            <li role="separator" className={styles.separator} />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={pick(() => setShowRecords(true))}
              >
                {t('minesweeper.menu.records')}
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className={styles.panel} inert={showRecords}>
        <div className={styles.header}>
          <div className={styles.counter}>
            <Counter
              value={minesLeft(game)}
              label={t('minesweeper.minesLeft', { count: minesLeft(game) })}
            />
          </div>
          <button
            type="button"
            className={styles.face}
            aria-label={t('minesweeper.newGame')}
            title={t('minesweeper.newGame')}
            onClick={() => newGame()}
          >
            <Face mood={mood} />
          </button>
          <div className={styles.counter}>
            <GameTimer startedAt={startedAt} stoppedAt={stoppedAt} />
          </div>
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-label={t('minesweeper.board', {
            level: t(`minesweeper.levels.${levelId}`),
          })}
          aria-disabled={over || undefined}
          className={styles.board}
          onClick={onBoardClick}
          onContextMenu={onBoardContextMenu}
          onKeyDown={onBoardKeyDown}
          onPointerDown={(e) => {
            if (e.button === 0 && !over && cellIndex(e) !== null)
              setPressing(true);
          }}
          onPointerUp={() => setPressing(false)}
          onPointerLeave={() => setPressing(false)}
          onPointerCancel={() => setPressing(false)}
        >
          {Array.from({ length: level.rows }, (_, row) => (
            <div role="row" key={row} className={styles.row}>
              {Array.from({ length: level.cols }, (_, col) => {
                const index = row * level.cols + col;
                return (
                  <BoardCell
                    key={col}
                    t={t}
                    index={index}
                    row={row + 1}
                    col={col + 1}
                    view={viewOf(game, index)}
                    focusable={index === focused}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <p
          role="status"
          className={newRecord ? styles.banner : styles.visuallyHidden}
        >
          {announcement}
        </p>
      </div>

      {showRecords && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={recordsTitleId}
          className={styles.records}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              closeRecords();
            }
          }}
        >
          <h3 id={recordsTitleId} className={styles.recordsTitle}>
            {t('minesweeper.records.title')}
          </h3>
          <dl className={styles.recordsList}>
            {LEVEL_IDS.map((id) => (
              <React.Fragment key={id}>
                <dt>{t(`minesweeper.levels.${id}`)}</dt>
                <dd>
                  {records[id] === undefined
                    ? t('minesweeper.records.none')
                    : t('minesweeper.records.seconds', { count: records[id] })}
                </dd>
              </React.Fragment>
            ))}
          </dl>
          <button
            type="button"
            className={styles.ok}
            // The dialog opens from the menu: OK gets the focus.
            autoFocus
            onClick={closeRecords}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
