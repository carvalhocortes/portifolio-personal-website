import { describe, expect, it } from 'vitest';
import { routeFor } from './routes';

describe('routeFor', () => {
  it('opens the desktop at /desktop, with or without the trailing slash', () => {
    expect(routeFor('/desktop')).toBe('desktop');
    expect(routeFor('/desktop/')).toBe('desktop');
  });

  it('opens the landing page anywhere else', () => {
    expect(routeFor('/')).toBe('landing');
    expect(routeFor('/desktopx')).toBe('landing');
    expect(routeFor('/terminal')).toBe('landing');
  });
});
