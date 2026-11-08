import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../../shared/i18n';
import { COMMAND_LINK_PREFIX } from '../../../shared/lib/commandLink';
import { executeCommand, help } from './index';
import { dir } from './dir';
import { hobbies } from './hobbies';
import { ver } from './ver';
import { volunteer } from './volunteer';
import { welcome } from './welcome';

const PUBLIC_DIR = resolve(__dirname, '../../../../public');
const IMAGE_PATTERN = /!\[([^\]]+)\]\(\.\/(resources\/[^)\s]+)(?: "[^"]*")?\)/g;

const images = (markdown: string) =>
  [...markdown.matchAll(IMAGE_PATTERN)].map(([, alt, path]) => ({ alt, path }));

const commandLinks = (markdown: string) =>
  [...markdown.matchAll(/\]\(#cmd:([^)]+)\)/g)].map(([, cmd]) =>
    decodeURIComponent(cmd)
  );

// Runs a command and reports whether it exists. The language command toggles
// the language as a side effect, so the previous language is restored.
const runs = (command: string): boolean => {
  const lang = i18n.language;
  const notFound = i18n.t('terminal.commandNotFound');
  const output = executeCommand(command);
  void i18n.changeLanguage(lang);
  return output !== notFound;
};

const ALIASES = {
  'pt-BR': [
    'start',
    'bem-vindo',
    'inicio',
    'sobre',
    'info',
    'hobbies',
    'interesses',
    'trabalho-voluntario',
    'voluntario',
    'tv',
    'contato',
    'email',
    'ajuda',
    'help',
    'h',
    'dir',
    'ls',
    'ver',
    'versao',
    'idioma',
    'language',
    'lang',
    'limpar',
    'cls',
  ],
  'en-US': [
    'start',
    'welcome',
    'about',
    'hobbies',
    'volunteer',
    'v',
    'contact',
    'help',
    'dir',
    'ls',
    'ver',
    'version',
    'clear',
    'cls',
  ],
} as const;

describe.each(['pt-BR', 'en-US'] as const)('DOS commands in %s', (lang) => {
  beforeEach(async () => {
    await i18n.changeLanguage(lang);
  });

  it.each(ALIASES[lang])('"%s" runs a command', (alias) => {
    expect(runs(alias)).toBe(true);
    expect(runs(alias.toUpperCase())).toBe(true);
  });

  it('answers unknown commands in DOS style', () => {
    expect(executeCommand('xyz')).toBe(
      lang === 'pt-BR'
        ? 'Comando ou nome de arquivo inválido'
        : 'Bad command or file name'
    );
  });

  it('shows the system version', () => {
    expect(ver()).toBe(
      lang === 'pt-BR'
        ? 'CARVALHO-CORTES Versão 1984.02.07'
        : 'CARVALHO-CORTES Version 1984.02.07'
    );
  });

  it('help lists every command as a clickable link, outside code blocks', () => {
    const output = help();
    expect(output).not.toContain('```');
    const links = commandLinks(output);
    expect(links).toEqual(
      expect.arrayContaining(
        ['about', 'hobbies', 'volunteer', 'contact', 'help', 'dir', 'ver'].map(
          (key) =>
            (
              i18n.t(`commands.${key}.aliases`, {
                returnObjects: true,
              }) as string[]
            )[0]
        )
      )
    );
    links.forEach((link) => expect(runs(link)).toBe(true));
  });

  it('welcome has clickable help and shortcuts for every screen size', () => {
    (['small', 'medium', 'xlarge'] as const).forEach((size) => {
      const links = commandLinks(welcome(size));
      expect(links.length).toBeGreaterThanOrEqual(6);
      links.forEach((link) => expect(runs(link)).toBe(true));
    });
  });

  it('dir lists the sections as files that open when clicked', () => {
    const output = dir();
    expect(output).toContain('CARVALHO-CORTES');
    const links = commandLinks(output);
    expect(links).toHaveLength(6);
    links.forEach((link) => expect(runs(link)).toBe(true));
    expect(output).toContain(i18n.t('dir.summary', { count: 6 }));
  });
});

describe('images keep working', () => {
  afterAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it.each(['pt-BR', 'en-US'])(
    'hobbies has 10 and volunteer 3 images (%s)',
    async (lang) => {
      await i18n.changeLanguage(lang);
      expect(images(hobbies())).toHaveLength(10);
      expect(images(volunteer())).toHaveLength(3);
    }
  );

  it('every image has alt text and an existing file', () => {
    [...images(hobbies()), ...images(volunteer())].forEach(({ alt, path }) => {
      expect(alt.trim()).not.toBe('');
      expect(existsSync(resolve(PUBLIC_DIR, path))).toBe(true);
    });
  });

  it('command links use the shared prefix', () => {
    expect(help()).toContain(COMMAND_LINK_PREFIX);
  });
});

describe('volunteer images', () => {
  it('are marked small (smaller than photos)', () => {
    expect(volunteer().match(/ "small"\)/g)).toHaveLength(3);
    expect(hobbies()).not.toContain('"small"');
  });
});
