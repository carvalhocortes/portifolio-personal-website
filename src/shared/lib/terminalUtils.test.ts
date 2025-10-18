import { describe, expect, it, vi } from 'vitest';
import {
  generateCommandId,
  isEmptyOrWhitespace,
  normalizeCommand,
} from './terminalUtils';

describe('terminalUtils', () => {
  describe('normalizeCommand', () => {
    it('should convert command to lowercase', () => {
      expect(normalizeCommand('HELP')).toBe('help');
      expect(normalizeCommand('About')).toBe('about');
      expect(normalizeCommand('CLEar')).toBe('clear');
    });

    it('should trim whitespace from command', () => {
      expect(normalizeCommand('  help  ')).toBe('help');
      expect(normalizeCommand('\tabout\n')).toBe('about');
      expect(normalizeCommand('   clear   ')).toBe('clear');
    });

    it('should handle lowercase and trim together', () => {
      expect(normalizeCommand('  HELP  ')).toBe('help');
      expect(normalizeCommand('\tABOUT\n')).toBe('about');
    });

    it('should handle empty strings', () => {
      expect(normalizeCommand('')).toBe('');
      expect(normalizeCommand('   ')).toBe('');
    });
  });

  describe('generateCommandId', () => {
    it('should generate a numeric ID', () => {
      const id = generateCommandId();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateCommandId();
      // Small delay to ensure different timestamps
      vi.useFakeTimers();
      vi.advanceTimersByTime(1);
      const id2 = generateCommandId();
      vi.useRealTimers();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs based on timestamp', () => {
      const now = Date.now();
      const id = generateCommandId();

      // ID should be close to current timestamp
      expect(id).toBeGreaterThanOrEqual(now - 100);
      expect(id).toBeLessThanOrEqual(now + 100);
    });
  });

  describe('isEmptyOrWhitespace', () => {
    it('should return true for empty strings', () => {
      expect(isEmptyOrWhitespace('')).toBe(true);
    });

    it('should return true for whitespace-only strings', () => {
      expect(isEmptyOrWhitespace('   ')).toBe(true);
      expect(isEmptyOrWhitespace('\t')).toBe(true);
      expect(isEmptyOrWhitespace('\n')).toBe(true);
      expect(isEmptyOrWhitespace('  \t\n  ')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmptyOrWhitespace('help')).toBe(false);
      expect(isEmptyOrWhitespace('  help  ')).toBe(false);
      expect(isEmptyOrWhitespace('a')).toBe(false);
    });

    it('should return false for strings with content and whitespace', () => {
      expect(isEmptyOrWhitespace(' text ')).toBe(false);
      expect(isEmptyOrWhitespace('\tcommand\n')).toBe(false);
    });
  });
});
