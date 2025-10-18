export const normalizeCommand = (command: string): string => {
  return command.toLowerCase().trim();
};

export const generateCommandId = (): number => {
  return Date.now();
};

export const isEmptyOrWhitespace = (text: string): boolean => {
  return text.trim().length === 0;
};
