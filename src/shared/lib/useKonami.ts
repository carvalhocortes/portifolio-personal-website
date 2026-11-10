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
 * Calls `onCode` when the keys of `sequence` are typed in order. Letters typed
 * in a text field don't count, so nobody triggers it by writing in the
 * Terminal; arrows still do, since they write nothing.
 */
export const useSecretSequence = (
  sequence: readonly string[],
  onCode: () => void,
  enabled = true
) => {
  // The last keys typed, as many as the sequence has.
  const recent = useRef<string[]>([]);
  const callback = useRef(onCode);
  useEffect(() => {
    callback.current = onCode;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key.length === 1 && isTyping(e.target)) {
        recent.current = [];
        return;
      }
      // Compared at the end, so a slip like "cacacildis" still counts.
      recent.current = [...recent.current, key].slice(-sequence.length);
      if (
        recent.current.length === sequence.length &&
        recent.current.every((k, i) => k === sequence[i])
      ) {
        recent.current = [];
        callback.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, sequence]);
};

/** Calls `onCode` when ↑ ↑ ↓ ↓ ← → ← → B A is typed. */
export const useKonami = (onCode: () => void, enabled = true) =>
  useSecretSequence(KONAMI, onCode, enabled);

/** Typing "cacildis" on the desktop turns the Mussum mode on or off. */
export const CACILDIS = [...'cacildis'];
