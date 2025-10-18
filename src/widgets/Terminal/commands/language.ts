import i18n from '../../../shared/i18n';

export const language = (args?: string): string => {
  const currentLang = i18n.language;

  // Se não passou argumento, mostra o idioma atual e os disponíveis
  if (!args || args.trim() === '') {
    return `${i18n.t('language.current', { language: currentLang })}\n${i18n.t('language.available')}\n${i18n.t('language.usage')}`;
  }

  const lang = args.trim().toLowerCase();

  // Valida se o idioma é suportado
  if (lang !== 'pt-br' && lang !== 'en-us') {
    return `${i18n.t('language.available')}\n${i18n.t('language.usage')}`;
  }

  // Troca o idioma
  i18n.changeLanguage(lang);

  return i18n.t('language.changed', { language: lang });
};
