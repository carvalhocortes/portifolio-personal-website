import { useSyncExternalStore } from 'react';
import i18n from './config';
import { MUSSUM } from './mussumProcessor';

export { MUSSUM };

// The language before the mode was turned on, to go back to it.
let previous = 'pt-BR';
// The hidden pt-MUSSUM button in the Start menu, once found, stays until a
// reload.
let revealed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export const isMussum = (language: string = i18n.language) =>
  language === MUSSUM;

/** Shows the pt-MUSSUM button in the Start menu. */
export const revealMussum = () => {
  if (revealed) return;
  revealed = true;
  notify();
};

export const turnMussumOn = () => {
  if (isMussum()) return;
  previous = i18n.language;
  revealMussum();
  void i18n.changeLanguage(MUSSUM);
};

/** Back to the language before the mode. */
export const turnMussumOff = () => {
  if (!isMussum()) return;
  void i18n.changeLanguage(previous);
};

/** Turns the mode on or off; returns true when it ends up on. */
export const toggleMussum = (): boolean => {
  if (isMussum()) {
    turnMussumOff();
    return false;
  }
  turnMussumOn();
  return true;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useMussumRevealed = () =>
  useSyncExternalStore(subscribe, () => revealed);

/** For tests: back to a fresh page load. */
export const resetMussumForTests = () => {
  previous = 'pt-BR';
  revealed = false;
  notify();
};
