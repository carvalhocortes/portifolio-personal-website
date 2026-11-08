import type { ComponentType } from 'react';

export type ProgramId =
  | 'browser'
  | 'terminal'
  | 'notepad'
  | 'clock'
  | 'recycleBin';

export interface ProgramProps {
  /** True while this program's window is the active (front) one. */
  isActive: boolean;
  /** Closes this program's window (on the desktop only). */
  onClose?: () => void;
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
  /**
   * How it starts when the desktop appears; closed if not set. 'front' is
   * open and active, in front of the others.
   */
  startup?: 'open' | 'minimized' | 'front';
  /** Where its window first appears; the cascade if not set. */
  placement?: 'cascade' | 'center' | 'top-right';
}
