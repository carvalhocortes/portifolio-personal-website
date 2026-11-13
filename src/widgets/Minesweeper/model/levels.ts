export type LevelId = 'beginner' | 'intermediate' | 'expert';

export interface Level {
  id: LevelId;
  cols: number;
  rows: number;
  mines: number;
}

/** The three classic sizes of the genre. */
export const LEVELS: Record<LevelId, Level> = {
  beginner: { id: 'beginner', cols: 9, rows: 9, mines: 10 },
  intermediate: { id: 'intermediate', cols: 16, rows: 16, mines: 40 },
  expert: { id: 'expert', cols: 30, rows: 16, mines: 99 },
};

export const LEVEL_IDS = Object.keys(LEVELS) as LevelId[];

export const isLevelId = (value: unknown): value is LevelId =>
  typeof value === 'string' && value in LEVELS;
