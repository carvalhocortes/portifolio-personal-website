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
