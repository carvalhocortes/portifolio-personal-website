export type Route = 'landing' | 'desktop';

/** The Windows 95 desktop lives at /desktop; every other path is the landing page. */
export const routeFor = (pathname: string): Route =>
  /^\/desktop\/?$/.test(pathname) ? 'desktop' : 'landing';
