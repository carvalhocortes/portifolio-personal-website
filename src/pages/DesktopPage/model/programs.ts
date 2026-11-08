import type {
  ProgramDefinition,
  ProgramId,
} from '../../../entities/Program/model/types';
import { MsDosIcon } from '../../../shared/ui/icons';
import { Terminal } from '../../../widgets/Terminal/ui/Terminal';

export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'terminal',
    titleKey: 'programs.terminal',
    Icon: MsDosIcon,
    Component: Terminal,
    // Wide enough for the 89-column welcome banner (8px per column), plus
    // padding, scrollbar and the window frame.
    defaultSize: { width: 780, height: 500 },
  },
];

/** Opened when the site loads; on phones it is the only screen. */
export const MAIN_PROGRAM: ProgramId = 'terminal';
