// The browser storage can throw (blocked site data, private windows): these
// read and write quietly, and a value just isn't remembered then.

export const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStored = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the choice just isn't remembered.
  }
};
