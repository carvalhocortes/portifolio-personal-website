import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '../config/constants';

export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

const getScreenSize = (width: number): ScreenSize => {
  if (width < BREAKPOINTS.TABLET) return 'small';
  if (width < BREAKPOINTS.DESKTOP) return 'medium';
  if (width < BREAKPOINTS.WIDE) return 'large';
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
