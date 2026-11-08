import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import i18n from '../../../shared/i18n';
import { about } from './about';
import { contact } from './contact';
import { hobbies } from './hobbies';
import { volunteer } from './volunteer';

// Guards the Terminal output while its content moves to content/site.yaml:
// the commands must print exactly what they printed before. Image paths are
// normalized because they changed on purpose: relative to absolute, and the
// photos from PNG to WebP.
const normalize = (markdown: string) =>
  markdown
    .replace(/\]\(\.?\/resources\//g, '](resources/')
    .replace(/(resources\/[\w-]+)\.(?:png|webp)/g, '$1.img');

const COMMANDS = { about, hobbies, volunteer, contact };

describe('content commands output', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 8));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  for (const lang of ['pt-BR', 'en-US']) {
    for (const [name, fn] of Object.entries(COMMANDS)) {
      it(`${name} in ${lang} prints the same Markdown`, async () => {
        await i18n.changeLanguage(lang);
        expect(normalize(fn())).toMatchSnapshot();
      });
    }
  }
});
