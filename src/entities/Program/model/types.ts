import type { ComponentType } from 'react';

export type ProgramId = 'browser' | 'terminal' | 'notepad';

export interface ProgramProps {
  /** True while this program's window is the active (front) one. */
  isActive: boolean;
}

export interface ProgramDefinition {
  id: ProgramId;
  /** i18n key of the program name (icon, Start menu, taskbar). */
  titleKey?: string;
  /** i18n key of a longer window title; gets the name as {{name}}. */
  windowTitleKey?: string;
  Icon: ComponentType<{ size?: number }>;
  Component: ComponentType<ProgramProps>;
  /** Preferred window size in px; shrunk to fit small screens. */
  defaultSize: { width: number; height: number };
  /** How it starts when the desktop appears; closed if not set. */
  startup?: 'open' | 'minimized';
  /** Opens in the middle of the desktop instead of the cascade. */
  centered?: boolean;
}
