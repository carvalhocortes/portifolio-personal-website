import { useTranslation } from 'react-i18next';

/** The texts, the current language and the PT/EN toggle. */
export const useContentLanguage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const toggleLanguage = () =>
    void i18n.changeLanguage(language.startsWith('en') ? 'pt-BR' : 'en-US');

  return { t, language, toggleLanguage };
};
