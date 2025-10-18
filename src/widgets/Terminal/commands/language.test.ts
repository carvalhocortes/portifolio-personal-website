import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { language } from './language';

// Mock do i18n
vi.mock('../../../shared/i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'pt-BR',
    t: vi.fn((key: string, options?: { lang?: string }) => {
      const translations: Record<string, string> = {
        'language.current': 'Idioma atual: {{lang}}',
        'language.changed': 'Idioma alterado para: {{lang}}',
        'language.available': 'Idiomas disponíveis: pt-br, en-us',
        'language.usage': 'Uso: language <pt-br|en-us>',
      };
      let text = translations[key] || key;
      if (options?.lang) {
        text = text.replace('{{lang}}', options.lang);
      }
      return text;
    }),
  },
}));

describe('language command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show current language when called without arguments', () => {
    const result = language();
    expect(result).toContain('Idioma atual:');
    expect(result).toContain('Idiomas disponíveis:');
  });

  it('should change to pt-br when "pt-br" is provided', () => {
    const result = language('pt-br');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt-br');
    expect(result).toContain('Idioma alterado para:');
  });

  it('should change to en-us when "en-us" is provided', () => {
    const result = language('en-us');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en-us');
    expect(result).toContain('Idioma alterado para:');
  });

  it('should be case-insensitive for pt-br', () => {
    const result = language('PT-BR');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt-br');
    expect(result).toContain('Idioma alterado para:');
  });

  it('should be case-insensitive for en-us', () => {
    const result = language('EN-US');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en-us');
    expect(result).toContain('Idioma alterado para:');
  });

  it('should show error message for invalid language', () => {
    const result = language('fr');
    expect(i18n.changeLanguage).not.toHaveBeenCalled();
    expect(result).toContain('Idiomas disponíveis:');
    expect(result).toContain('Uso:');
  });

  it('should show error message for empty string', () => {
    const result = language('');
    expect(result).toContain('Idioma atual:');
    expect(result).toContain('Idiomas disponíveis:');
  });

  it('should handle multiple spaces', () => {
    const result = language('   ');
    expect(result).toContain('Idioma atual:');
    expect(result).toContain('Idiomas disponíveis:');
  });
});
