import { content } from '../../../entities/Content';
import type { ProgramDefinition } from '../../../entities/Program/model/types';
import { BrowserIcon, MsDosIcon, NotepadIcon } from '../../../shared/ui/icons';
import { Browser } from '../../../widgets/Browser/ui/Browser';
import { Notepad } from '../../../widgets/Notepad/ui/Notepad';
import { Terminal } from '../../../widgets/Terminal/ui/Terminal';

/**
 * Desktop programs, in icon order. The desktop starts with the browser and the
 * Terminal minimized and the Leia-me.txt open in front.
 */
export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'browser',
    titleKey: 'programs.browser',
    Icon: BrowserIcon,
    Component: Browser,
    // Larger than any screen: it opens beside the icons, filling the rest.
    defaultSize: { width: 1600, height: 1200 },
    startup: 'minimized',
  },
  {
    id: 'terminal',
    titleKey: 'programs.terminal',
    Icon: MsDosIcon,
    Component: Terminal,
    // Wide enough for the 89-column welcome banner (8px per column), plus
    // padding, scrollbar and the window frame.
    defaultSize: { width: 780, height: 500 },
    startup: 'minimized',
  },
  {
    id: 'notepad',
    name: content.leiame.nome,
    windowTitleKey: 'programs.notepadWindow',
    Icon: NotepadIcon,
    Component: Notepad,
    // Fits the whole text without scrolling on a 1024 × 768 screen.
    defaultSize: { width: 600, height: 650 },
    startup: 'open',
    centered: true,
  },
];
