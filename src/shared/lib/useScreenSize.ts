import { useEffect, useState } from 'react';

export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Breakpoints em consonância com as variáveis CSS
 * - CSS variables: --container-md: 768px, --container-lg: 1024px, --container-xl: 1280px
 */
const BREAKPOINTS = {
  medium: 768, // Tablets e acima
  large: 1024, // Desktops e acima
  xlarge: 1280, // Desktops grandes e acima
} as const;

const getScreenSize = (width: number): ScreenSize => {
  if (width < BREAKPOINTS.medium) return 'small';
  if (width < BREAKPOINTS.large) return 'medium';
  if (width < BREAKPOINTS.xlarge) return 'large';
  return 'xlarge';
};

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() =>
    getScreenSize(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
