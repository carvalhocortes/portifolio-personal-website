import { describe, expect, it } from 'vitest';
import { routeFor } from './routes';

describe('routeFor', () => {
  it('opens the desktop at the root and at unknown paths', () => {
    expect(routeFor('/')).toBe('desktop');
    expect(routeFor('/desktop')).toBe('desktop');
    expect(routeFor('/terminalx')).toBe('desktop');
  });

  it('opens the Terminal alone at /terminal, with or without the slash', () => {
    expect(routeFor('/terminal')).toBe('terminal');
    expect(routeFor('/terminal/')).toBe('terminal');
  });

  it('opens the landing page alone at /landing, with or without the slash', () => {
    expect(routeFor('/landing')).toBe('landing');
    expect(routeFor('/landing/')).toBe('landing');
  });
});
