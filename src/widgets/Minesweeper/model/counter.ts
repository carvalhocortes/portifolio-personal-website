/** Three red digits; negative numbers show a minus sign (down to -99). */
export const formatCounter = (value: number) => {
  const clamped = Math.max(-99, Math.min(999, value));
  return clamped < 0
    ? `-${String(-clamped).padStart(2, '0')}`
    : String(clamped).padStart(3, '0');
};
