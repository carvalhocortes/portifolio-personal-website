/** Hand angles in degrees, clockwise from 12. */
export const handAngles = (date: Date) => {
  const s = date.getSeconds();
  const m = date.getMinutes() + s / 60;
  const h = (date.getHours() % 12) + m / 60;
  return { hour: h * 30, minute: m * 6, second: s * 6 };
};

/** "Sábado, 8 de novembro de 2026" / "Saturday, November 8, 2026". */
export const longDate = (date: Date, language: string) => {
  const text = date.toLocaleDateString(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
};
