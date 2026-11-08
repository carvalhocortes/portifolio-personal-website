import { useEffect, useState } from 'react';

const ACTIVITY = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;

/** True after `ms` without mouse, touch, wheel or keyboard activity. */
export const useIdle = (ms: number, enabled = true): boolean => {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      return;
    }
    let timer = window.setTimeout(() => setIdle(true), ms);
    const onActivity = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    ACTIVITY.forEach((type) =>
      window.addEventListener(type, onActivity, { passive: true })
    );
    return () => {
      window.clearTimeout(timer);
      ACTIVITY.forEach((type) => window.removeEventListener(type, onActivity));
    };
  }, [ms, enabled]);

  return idle;
};
