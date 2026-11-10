import i18n from '../../../shared/i18n';

export const language = (): string => {
  // The Mussum mode counts as Portuguese, so it goes to English.
  const newLang = i18n.language.startsWith('en') ? 'pt-BR' : 'en-US';
  i18n.changeLanguage(newLang);
  return i18n.t('language.changed', { language: newLang });
};
