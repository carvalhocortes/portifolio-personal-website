import { LEVEL_IDS, isLevelId, type LevelId } from './levels';

export const LEVEL_KEY = 'cc84.minesweeperLevel';
export const RECORDS_KEY = 'cc84.minesweeperRecords';

/** Best time in seconds per level; missing when never won. */
export type Records = Partial<Record<LevelId, number>>;

// Storage can throw (blocked site data) or hold anything: every read falls
// back quietly and every write may just not happen.

export const loadLevel = (): LevelId => {
  try {
    const saved = localStorage.getItem(LEVEL_KEY);
    return isLevelId(saved) ? saved : 'beginner';
  } catch {
    return 'beginner';
  }
};

export const saveLevel = (level: LevelId) => {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch {
    // Not remembered.
  }
};

export const loadRecords = (): Records => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(RECORDS_KEY) ?? '{}'
    );
    if (typeof parsed !== 'object' || parsed === null) return {};
    const records: Records = {};
    for (const level of LEVEL_IDS) {
      const value = (parsed as Record<string, unknown>)[level];
      if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        records[level] = value;
      }
    }
    return records;
  } catch {
    return {};
  }
};

export const saveRecords = (records: Records) => {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Not remembered.
  }
};
