import type { ProgramDefinition } from '../../../entities/Program/model/types';
import {
  BrowserIcon,
  ClockIcon,
  IcqIcon,
  MsDosIcon,
  NotepadIcon,
  RecycleBinIcon,
  SolitaireIcon,
} from '../../../shared/ui/icons';
import { Browser } from '../../../widgets/Browser/ui/Browser';
import { ClockApp } from '../../../widgets/ClockApp';
import { Icq } from '../../../widgets/Icq';
import { RecycleBin } from '../../../widgets/RecycleBin';
import { Solitaire } from '../../../widgets/Solitaire';
import { Notepad } from '../../../widgets/Notepad/ui/Notepad';
import { Terminal } from '../../../widgets/Terminal/ui/Terminal';

/**
 * Desktop programs, in icon order. The desktop starts with the browser and the
 * Terminal minimized, the Clock open in the top-right corner and the
 * Leia-me.txt open in front. Solitaire and the Recycle Bin start closed.
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
    id: 'solitaire',
    titleKey: 'programs.solitaire',
    Icon: SolitaireIcon,
    Component: Solitaire,
    // Seven columns of cards about 80 px wide, plus the menu and status bars.
    defaultSize: { width: 660, height: 520 },
  },
  {
    id: 'recycleBin',
    titleKey: 'recycleBin.name',
    Icon: RecycleBinIcon,
    Component: RecycleBin,
    defaultSize: { width: 560, height: 420 },
  },
  {
    id: 'icq',
    titleKey: 'icq.name',
    Icon: IcqIcon,
    Component: Icq,
    // Tall and narrow like the contact list, wide enough for the captcha.
    defaultSize: { width: 380, height: 560 },
    startup: 'minimized',
  },
];
