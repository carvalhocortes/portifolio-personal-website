import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18N_OPTIONS } from './config';
import { MUSSUM, mussumProcessor } from './mussumProcessor';

// A fresh i18next with the site's options, as on a first page load.
const load = async () => {
  const i18n = createInstance();
  await i18n.use(LanguageDetector).use(mussumProcessor).init(I18N_OPTIONS);
  return i18n;
};

// Like a real browser: navigator.language is the first of navigator.languages.
const setBrowserLanguages = (languages: string[]) => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(languages[0]);
};

describe('language on page load', () => {
  afterEach(() => {
    localStorage.removeItem('i18nextLng');
    vi.restoreAllMocks();
  });

  it('follows the browser language on the first visit', async () => {
    localStorage.removeItem('i18nextLng');
    setBrowserLanguages(['en-GB', 'en']);
    expect((await load()).language).toBe('en-US');
    localStorage.removeItem('i18nextLng');
    setBrowserLanguages(['pt-PT']);
    expect((await load()).language).toBe('pt-BR');
  });

  it('falls back to Portuguese for other languages', async () => {
    localStorage.removeItem('i18nextLng');
    setBrowserLanguages(['es-ES']);
    expect((await load()).language).toBe('pt-BR');
  });

  it('remembers the PT/EN choice after a reload', async () => {
    setBrowserLanguages(['pt-BR']);
    const first = await load();
    await first.changeLanguage('en-US');
    expect(localStorage.getItem('i18nextLng')).toBe('en-US');
    expect((await load()).language).toBe('en-US');
  });
});

describe('Mussum mode language', () => {
  afterEach(() => {
    localStorage.removeItem('i18nextLng');
    vi.restoreAllMocks();
  });

  it('converts the pt-BR texts and leaves PT and EN alone', async () => {
    setBrowserLanguages(['pt-BR']);
    const i18n = await load();
    const original = i18n.t('terminal.helpFooter');
    await i18n.changeLanguage(MUSSUM);
    const converted = i18n.t('terminal.helpFooter');
    expect(converted).not.toBe(original);
    expect(converted).toMatch(/is\b/);
    expect(i18n.t('terminal.helpFooter', { lng: 'pt-BR' })).toBe(original);
    expect(i18n.t('terminal.helpFooter', { lng: 'en-US' })).toMatch(/Enter/);
  });

  it('keeps the Terminal command aliases, also in lists', async () => {
    setBrowserLanguages(['pt-BR']);
    const i18n = await load();
    const aliases = i18n.t('commands.help.aliases', { returnObjects: true });
    await i18n.changeLanguage(MUSSUM);
    expect(i18n.t('commands.help.aliases', { returnObjects: true })).toEqual(
      aliases
    );
  });

  it('converts each item of a list of texts', async () => {
    setBrowserLanguages(['pt-BR']);
    const i18n = await load();
    const lines = i18n.t('secrets.fortune', { returnObjects: true });
    await i18n.changeLanguage(MUSSUM);
    expect(i18n.t('secrets.fortune', { returnObjects: true })).not.toEqual(
      lines
    );
  });

  it('is never saved: a reload goes back to the language before', async () => {
    setBrowserLanguages(['pt-BR']);
    const i18n = await load();
    await i18n.changeLanguage('en-US');
    await i18n.changeLanguage(MUSSUM);
    expect(localStorage.getItem('i18nextLng')).toBe('en-US');
    expect((await load()).language).toBe('en-US');
  });

  it('keeps the values put into a text, like a name or a command link', async () => {
    setBrowserLanguages(['pt-BR']);
    const i18n = await load();
    await i18n.changeLanguage(MUSSUM);
    expect(
      i18n.t('icq.reply', { name: 'Mariana', email: 'm@x.com' })
    ).toContain('Mariana');
    expect(
      i18n.t('welcome.helpText', { help: '[ajuda](#cmd:ajuda)' })
    ).toContain('[ajuda](#cmd:ajuda)');
  });
});
