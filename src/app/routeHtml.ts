// Used by the build (vite.config.ts) to write /landing and /terminal.
export const SITE_URL = 'https://carvalhocortes.com.br';

/** The page's HTML for a direct route: its title and its own og:url. */
export const htmlForRoute = (
  html: string,
  route: string,
  title: string
): string =>
  html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${title}$2`
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${SITE_URL}/${route}/$2`
    );
