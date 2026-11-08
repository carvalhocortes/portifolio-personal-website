import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Keeps <html lang> with the site language, for screen readers and translators. */
export const useDocumentLanguage = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    document.documentElement.lang = language.startsWith('en') ? 'en' : 'pt-BR';
  }, [language]);
};
