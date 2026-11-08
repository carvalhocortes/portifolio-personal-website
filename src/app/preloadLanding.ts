import geistFont from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { content, resource } from '../entities/Content';

/** What the top of the landing page shows first: the font, avatar and signature. */
const { avatar, assinatura } = content.pessoa;

/** The avatar's srcset and sizes: the same as the <img> in Hero.tsx. */
export const AVATAR_SRCSET = `${resource(avatar.arquivo)} 480w, ${resource(avatar.arquivo2x)} 960w`;
export const AVATAR_SIZES = '(max-width: 767px) 220px, 440px';

export const LANDING_PRELOADS = [
  { href: geistFont, as: 'font', type: 'font/woff2' },
  // With imagesrcset, the browser preloads the same size the page will use
  // (the 960px file on high-density phones).
  {
    href: resource(avatar.arquivo),
    as: 'image',
    srcset: AVATAR_SRCSET,
    sizes: AVATAR_SIZES,
  },
  // The signature is a CSS mask, which the browser fetches in CORS mode.
  { href: resource(assinatura.arquivo), as: 'image', cors: true },
] as const;

/**
 * Tells the browser to fetch them now, alongside the landing page's code,
 * instead of after the page is built and its styles are read.
 */
export const preloadLanding = (head: HTMLElement = document.head) => {
  for (const item of LANDING_PRELOADS) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = item.href;
    link.setAttribute('as', item.as);
    if ('srcset' in item) {
      link.setAttribute('imagesrcset', item.srcset);
      link.setAttribute('imagesizes', item.sizes);
    }
    if ('type' in item) link.type = item.type;
    // Fonts and CSS masks are fetched in CORS mode; the preload must match,
    // or the browser downloads the file a second time.
    if (item.as === 'font' || 'cors' in item) link.crossOrigin = 'anonymous';
    head.appendChild(link);
  }
};
