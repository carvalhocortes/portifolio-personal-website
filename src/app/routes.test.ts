import { describe, expect, it } from 'vitest';
import { pageFor, routeFor } from './routes';

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

describe('pageFor', () => {
  it('sends phones at / straight to the landing page', () => {
    expect(pageFor('/', 375)).toBe('landing');
    expect(pageFor('/qualquer', 767)).toBe('landing');
  });

  it('keeps the desktop on larger screens and the direct routes everywhere', () => {
    expect(pageFor('/', 768)).toBe('desktop');
    expect(pageFor('/terminal', 375)).toBe('terminal');
    expect(pageFor('/landing', 1280)).toBe('landing');
  });
});
