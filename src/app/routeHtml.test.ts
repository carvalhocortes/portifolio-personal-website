import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { htmlForRoute } from './routeHtml';

const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

describe('htmlForRoute', () => {
  it('gives a direct route its own title and og:url, keeping the canonical on /', () => {
    const page = htmlForRoute(html, 'terminal', 'Fernando Côrtes - Terminal');
    expect(page).toContain('<title>Fernando Côrtes - Terminal</title>');
    expect(page).toMatch(
      /property="og:title"\s+content="Fernando Côrtes - Terminal"/
    );
    expect(page).toContain(
      '<meta property="og:url" content="https://carvalhocortes.com.br/terminal/"'
    );
    expect(page).toContain(
      '<link rel="canonical" href="https://carvalhocortes.com.br/" />'
    );
  });

  it('has the link preview tags on the main page', () => {
    for (const tag of ['og:description', 'og:image', 'twitter:card']) {
      expect(html).toContain(tag);
    }
  });
});
