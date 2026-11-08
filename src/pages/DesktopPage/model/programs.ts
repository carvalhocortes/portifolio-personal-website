import type { ProgramDefinition } from '../../../entities/Program/model/types';
import {
  BrowserIcon,
  ClockIcon,
  MsDosIcon,
  NotepadIcon,
  RecycleBinIcon,
} from '../../../shared/ui/icons';
import { Browser } from '../../../widgets/Browser/ui/Browser';
import { ClockApp } from '../../../widgets/ClockApp';
import { RecycleBin } from '../../../widgets/RecycleBin';
import { Notepad } from '../../../widgets/Notepad/ui/Notepad';
import { Terminal } from '../../../widgets/Terminal/ui/Terminal';

/**
 * Desktop programs, in icon order. The desktop starts with the browser and the
 * Terminal minimized, the Clock open in the top-right corner and the
 * Leia-me.txt open in front. The Recycle Bin starts closed.
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
    titleKey: 'leiame.nome',
    windowTitleKey: 'programs.notepadWindow',
    Icon: NotepadIcon,
    Component: Notepad,
    // Fits the whole text without scrolling on a 1024 × 768 screen.
    defaultSize: { width: 600, height: 650 },
    startup: 'front',
    placement: 'center',
  },
  {
    id: 'clock',
    titleKey: 'programs.clock',
    Icon: ClockIcon,
    Component: ClockApp,
    // Small: the smallest window size (320 px wide), face and mode buttons.
    defaultSize: { width: 320, height: 340 },
    startup: 'open',
    placement: 'top-right',
  },
  {
    id: 'recycleBin',
    titleKey: 'recycleBin.name',
    Icon: RecycleBinIcon,
    Component: RecycleBin,
    defaultSize: { width: 560, height: 420 },
  },
];
