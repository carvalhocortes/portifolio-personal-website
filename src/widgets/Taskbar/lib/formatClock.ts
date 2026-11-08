/** Taskbar clock text (HH:MM) in the visitor's language. */
export const formatClock = (date: Date, language: string) =>
  new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
