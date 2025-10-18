import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

const resources = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

i18n
  .use(LanguageDetector) // Detecta idioma do navegador
  .use(initReactI18next) // Integração com React
  .init({
    resources,
    fallbackLng: 'pt-BR', // Idioma padrão se não detectar
    lng: 'pt-BR', // Idioma inicial
    interpolation: {
      escapeValue: false, // React já escapa por padrão
    },
    detection: {
      // Ordem de detecção: localStorage -> navigator
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Salva preferência do usuário
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
