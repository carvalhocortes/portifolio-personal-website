import i18n from '../../../shared/i18n';

export const language = (): string => {
  const currentLang = i18n.language;

  const newLang = currentLang === 'pt-BR' ? 'en-US' : 'pt-BR';
  i18n.changeLanguage(newLang);
  return i18n.t('language.changed', { language: newLang });
};
