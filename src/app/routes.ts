import { BREAKPOINTS } from '../shared/config/constants';

export type Route = 'desktop' | 'terminal' | 'landing';

/**
 * /terminal and /landing open one program on its own, full screen; every
 * other path is the Windows 95 desktop. The trailing slash is optional.
 */
export const routeFor = (pathname: string): Route => {
  if (/^\/terminal\/?$/.test(pathname)) return 'terminal';
  if (/^\/landing\/?$/.test(pathname)) return 'landing';
  return 'desktop';
};

/**
 * The page to load: the route, except that phones get the landing page at /
 * right away, without downloading the desktop and the Terminal first.
 */
export const pageFor = (pathname: string, width: number): Route => {
  const route = routeFor(pathname);
  return route === 'desktop' && width < BREAKPOINTS.TABLET ? 'landing' : route;
};
