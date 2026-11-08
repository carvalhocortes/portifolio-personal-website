import { createInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18N_OPTIONS } from './config';

// A fresh i18next with the site's options, as on a first page load.
const load = async () => {
  const i18n = createInstance();
  await i18n.use(LanguageDetector).init(I18N_OPTIONS);
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
