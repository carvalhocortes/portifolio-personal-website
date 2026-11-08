import data from '../../../../content/site.yaml';
import type { Localized, SiteContent } from './types';

/** All site content, from content/site.yaml. */
export const content = data as SiteContent;

/** Public URL of a file inside public/resources/. */
export const resource = (file: string): string => `/resources/${file}`;

/** Full years between `birth` (YYYY-MM-DD) and `today`. */
export const ageOn = (birth: string, today: Date = new Date()): number => {
  const [year, month, day] = birth.split('-').map(Number);
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age--;
  return age;
};

/**
 * Picks the text for an i18next language code ('pt-BR', 'en-US'…) and fills
 * the {idade} placeholder. Any language other than English falls back to pt.
 */
export const pick = (text: Localized, language: string): string => {
  const value = language.startsWith('en') ? text.en : text.pt;
  return value.replace(/\{idade\}/g, String(ageOn(content.pessoa.nascimento)));
};
