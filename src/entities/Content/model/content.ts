import type { TFunction } from 'i18next';
import data from '../../../../content/site.yaml';
import type { SiteContent } from './types';

/** Site data (photos, links, dates), from content/site.yaml. */
export const content = data as SiteContent;

/** Public URL of a file inside public/resources/. */
export const resource = (file: string): string => `/resources/${file}`;

/**
 * Public URL of a photo's small version (320px JPEG in resources/thumbs/),
 * for places that show it small, like the strip at the top of the landing.
 */
export const thumbnail = (file: string): string =>
  resource(`thumbs/${file.replace(/\.[^.]+$/, '')}.jpg`);

/** A list of texts from the i18n files (paragraphs, captions…). */
export const textList = (t: TFunction, key: string): string[] => {
  const value = t(key, { returnObjects: true }) as unknown;
  return Array.isArray(value) ? (value as string[]) : [];
};
