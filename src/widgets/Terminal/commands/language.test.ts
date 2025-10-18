import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../shared/i18n';
import { language } from './language';

// Mock do i18n
vi.mock('../../../shared/i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'pt-BR',
    t: vi.fn((key: string, options?: { language?: string }) => {
      const translations: Record<string, string> = {
        'language.changed': 'Idioma alterado para: {{language}}',
      };
      let text = translations[key] || key;
      if (options?.language) {
        text = text.replace('{{language}}', options.language);
      }
      return text;
    }),
  },
}));

describe('language command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should switch from pt-BR to en-US', () => {
    // Mock current language as pt-BR
    vi.mocked(i18n).language = 'pt-BR';

    const result = language();

    expect(i18n.changeLanguage).toHaveBeenCalledWith('en-US');
    expect(result).toContain('Idioma alterado para:');
    expect(result).toContain('en-US');
  });

  it('should switch from en-US to pt-BR', () => {
    // Mock current language as en-US
    vi.mocked(i18n).language = 'en-US';

    const result = language();

    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt-BR');
    expect(result).toContain('Idioma alterado para:');
    expect(result).toContain('pt-BR');
  });

  it('should default to pt-BR when current language is not recognized', () => {
    // Mock current language as something else
    vi.mocked(i18n).language = 'fr-FR';

    const result = language();

    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt-BR');
    expect(result).toContain('Idioma alterado para:');
    expect(result).toContain('pt-BR');
  });
});
