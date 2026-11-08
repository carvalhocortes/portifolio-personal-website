import { commandLink } from '../../../shared/lib/commandLink';
import i18n from '../../../shared/i18n';
import { about } from './about';
import { firstAlias } from './aliases';
import { contact } from './contact';
import { hobbies } from './hobbies';
import { volunteer } from './volunteer';

// Non-breaking spaces survive Markdown, so columns line up in the bitmap font.
const NBSP = ' ';
const NAME_WIDTH = 9;
const EXT_WIDTH = 4;
const SIZE_WIDTH = 10;
const EXE_SIZE = 54_645;

interface DirEntry {
  key: string;
  size: number;
}

const padEnd = (text: string, width: number) =>
  text + NBSP.repeat(Math.max(1, width - text.length));

const padStart = (text: string, width: number) =>
  NBSP.repeat(Math.max(1, width - text.length)) + text;

const formatSize = (size: number) =>
  size.toLocaleString(i18n.language).replace(/\s/g, '.');

const getEntries = (): DirEntry[] => [
  { key: 'about', size: about().length },
  { key: 'hobbies', size: hobbies().length },
  { key: 'volunteer', size: volunteer().length },
  { key: 'contact', size: contact().length },
  { key: 'help', size: EXE_SIZE },
  { key: 'language', size: EXE_SIZE },
];

export const dir = (): string => {
  const date = i18n.t('dir.date');
  const entries = getEntries();

  const lines = entries.map(({ key, size }) => {
    const [name, ext] = i18n.t(`dir.files.${key}`).split('.');
    return (
      commandLink(name, firstAlias(key)) +
      NBSP.repeat(Math.max(1, NAME_WIDTH - name.length)) +
      padEnd(ext, EXT_WIDTH) +
      padStart(formatSize(size), SIZE_WIDTH) +
      NBSP.repeat(2) +
      date
    );
  });

  const header = i18n.t('dir.folder');
  const summary =
    NBSP.repeat(NAME_WIDTH) + i18n.t('dir.summary', { count: entries.length });

  return `${header}\n\n${lines.join('  \n')}  \n${summary}`;
};
