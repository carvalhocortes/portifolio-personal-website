/** Marks the tab once the desktop boot screen has played, so a reload skips it. */
export const BOOTED_KEY = 'cc84.booted';

// Storage can throw (blocked site data, private mode): then the boot shows again.
export const hasBooted = (): boolean => {
  try {
    return sessionStorage.getItem(BOOTED_KEY) === '1';
  } catch {
    return false;
  }
};

export const markBooted = (): void => {
  try {
    sessionStorage.setItem(BOOTED_KEY, '1');
  } catch {
    // Nothing to do: the boot just plays again next time.
  }
};
