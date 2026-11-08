import { useTranslation } from 'react-i18next';
import { pick, type Localized } from '../../../entities/Content';

/**
 * The current language plus a `text()` helper that picks a content field in
 * it. Re-renders on language change.
 */
export const useContentLanguage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const text = (field: Localized) => pick(field, language);
  const toggleLanguage = () =>
    void i18n.changeLanguage(language.startsWith('en') ? 'pt-BR' : 'en-US');

  return { t, language, text, toggleLanguage };
};
