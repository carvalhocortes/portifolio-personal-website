import i18n from '../../../shared/i18n';

export const language = (args?: string): string => {
  const currentLang = i18n.language;

  if (!args || args.trim() === '') {
    return `${i18n.t('language.current', { language: currentLang })}\n${i18n.t('language.available')}\n${i18n.t('language.usage')}`;
  }

  const lang = args.trim().toLowerCase();

  if (lang !== 'pt-br' && lang !== 'en-us') {
    return `${i18n.t('language.available')}\n${i18n.t('language.usage')}`;
  }

  i18n.changeLanguage(lang);

  return i18n.t('language.changed', { language: lang });
};
