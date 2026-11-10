import type { PostProcessorModule, TOptions } from 'i18next';
import site from '../../../content/site.yaml';
import { mussumify } from '../lib/mussum';

/** The hidden language of the Mussum mode: pt-BR texts, converted. */
export const MUSSUM = 'pt-MUSSUM';

const OWNER = (site as { pessoa: { nome: string } }).pessoa.nome;

// Texts that never change: Terminal command aliases (they must keep
// working), ASCII art, and the boot and SETUP screens, aligned in columns.
const KEEP_KEYS =
  /(^|\.)(aliases|art|ascii)(\.|$)|^secrets\.setup\.|^abertura\./;

// i18next options that are not values put into the text.
const NOT_VALUES = new Set([
  'lng',
  'lngs',
  'fallbackLng',
  'ns',
  'defaultValue',
  'context',
  'keyPrefix',
  'postProcess',
  'returnObjects',
  'returnDetails',
  'joinArrays',
  'ordinal',
  'interpolation',
  'replace',
]);

/**
 * Values put into the text ({{name}}, {{help}}…) stay as they are: a
 * visitor's name, a command link, a title already converted on its own.
 */
const valuesOf = (options: TOptions | undefined): string[] =>
  Object.entries(options ?? {})
    .filter(([key, value]) => !NOT_VALUES.has(key) && typeof value === 'string')
    .map(([, value]) => value as string)
    .filter((value) => value.trim() !== '');

// The site has a few hundred texts, so converting each one once is enough.
const cache = new Map<string, string>();

/**
 * Converts every pt-BR text while the language is pt-MUSSUM; any other
 * language passes through untouched.
 */
export const mussumProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'mussum',
  process(
    value: string,
    key: string | string[],
    options: TOptions,
    translator: { language?: string }
  ) {
    const language =
      (options?.lng as string | undefined) ?? translator?.language;
    if (language !== MUSSUM || typeof value !== 'string') return value;
    const keys = Array.isArray(key) ? key : [key];
    if (keys.some((k) => KEEP_KEYS.test(k))) return value;
    const names = [OWNER, ...valuesOf(options)];
    const cacheKey = [value, ...names].join('\u0000');
    let result = cache.get(cacheKey);
    if (result === undefined) {
      result = mussumify(value, { names });
      cache.set(cacheKey, result);
    }
    return result;
  },
};
