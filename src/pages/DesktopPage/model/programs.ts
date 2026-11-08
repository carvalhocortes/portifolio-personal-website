import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { ChromeIcon, MsDosIcon } from '../../../shared/ui/icons';
import { Chrome } from '../../../widgets/Chrome/ui/Chrome';
import { Terminal } from '../../../widgets/Terminal/ui/Terminal';

export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'chrome',
    titleKey: 'programs.chrome',
    Icon: ChromeIcon,
    Component: Chrome,
    // Larger than any screen: it opens beside the icons, filling the rest.
    defaultSize: { width: 1600, height: 1200 },
  },
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
