import type { ComponentType } from 'react';

export type ProgramId = 'terminal';

export interface ProgramProps {
  /** True while this program's window is the active (front) one. */
  isActive: boolean;
}

export interface ProgramDefinition {
  id: ProgramId;
  /** i18n key of the program name. */
  titleKey: string;
  Icon: ComponentType<{ size?: number }>;
  Component: ComponentType<ProgramProps>;
  /** Preferred window size in px; shrunk to fit small screens. */
  defaultSize: { width: number; height: number };
}
