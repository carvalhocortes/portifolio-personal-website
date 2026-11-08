import i18n, { type InitOptions, type ResourceKey } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import site from '../../../content/site.yaml';
import { ageOn } from '../lib/age';

// Every text of the site, one file per language: content and interface.
import enUS from './locales/en-US.yaml';
import ptBR from './locales/pt-BR.yaml';

const resources = {
  'pt-BR': { translation: ptBR as ResourceKey },
  'en-US': { translation: enUS as ResourceKey },
};

export const I18N_OPTIONS: InitOptions = {
  resources,
  // No fixed `lng`: it would override the detector, so the browser language
  // and the PT/EN choice saved in localStorage would be ignored.
  fallbackLng: 'pt-BR',
  supportedLngs: ['pt-BR', 'en-US'],
  interpolation: {
    escapeValue: false,
    // {{idade}} in any text: the age from pessoa.nascimento in site.yaml.
    defaultVariables: {
      idade: ageOn(
        (site as { pessoa: { nascimento: string } }).pessoa.nascimento
      ),
    },
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init(I18N_OPTIONS);

export default i18n;
