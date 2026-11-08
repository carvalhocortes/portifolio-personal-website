import { useEffect, useRef } from 'react';

export const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * Calls `onCode` when ↑ ↑ ↓ ↓ ← → ← → B A is typed. Letters typed in a text
 * field don't count, so nobody triggers it by writing in the Terminal.
 */
export const useKonami = (onCode: () => void, enabled = true) => {
  const progress = useRef(0);
  const callback = useRef(onCode);
  useEffect(() => {
    callback.current = onCode;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key.length === 1 && isTyping(e.target)) {
        progress.current = 0;
        return;
      }
      if (key === KONAMI[progress.current]) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          callback.current();
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
};
