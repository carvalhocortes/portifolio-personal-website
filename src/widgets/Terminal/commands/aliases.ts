import i18n from '../../../shared/i18n';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const;

/** Aliases of a command (`commands.<key>.aliases`) in the given or current language. */
export const getAliases = (key: string, lng?: string): string[] =>
  i18n.t(`commands.${key}.aliases`, {
    returnObjects: true,
    ...(lng ? { lng } : {}),
  }) as string[];

export const firstAlias = (key: string): string => getAliases(key)[0];

/**
 * Aliases of a command in every supported language. Output already on screen
 * keeps links in the language it was written in, so they must still resolve
 * after the visitor switches language.
 */
export const getAllAliases = (key: string): string[] => [
  ...new Set(SUPPORTED_LANGUAGES.flatMap((lng) => getAliases(key, lng))),
];
