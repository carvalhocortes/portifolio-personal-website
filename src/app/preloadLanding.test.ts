import { describe, expect, it } from 'vitest';
import { LANDING_PRELOADS, preloadLanding } from './preloadLanding';

describe('preloadLanding', () => {
  it('asks for the font, avatar and signature up front', () => {
    const head = document.createElement('head');
    preloadLanding(head);
    const links = [...head.querySelectorAll('link[rel="preload"]')];
    expect(links).toHaveLength(LANDING_PRELOADS.length);
    expect(links.map((l) => l.getAttribute('as'))).toEqual([
      'font',
      'image',
      'image',
    ]);
    expect(links[0]).toHaveAttribute('crossorigin', 'anonymous');
    expect(links[0].getAttribute('href')).toMatch(/geist.*\.woff2/);
    expect(links[1].getAttribute('href')).toBe('/resources/avatar-480.webp');
    // The same choice of size as the page: the 960px file on dense screens.
    expect(links[1].getAttribute('imagesrcset')).toContain(
      'avatar-960.webp 960w'
    );
    expect(links[1].getAttribute('imagesizes')).toBe(
      '(max-width: 767px) 220px, 440px'
    );
    expect(links[2].getAttribute('href')).toBe('/resources/assinatura.webp');
    expect(links[2]).toHaveAttribute('crossorigin', 'anonymous');
  });
});
