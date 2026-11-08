/** Full years between `birth` (YYYY-MM-DD) and `today`. */
export const ageOn = (birth: string, today: Date = new Date()): number => {
  const [year, month, day] = birth.split('-').map(Number);
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age--;
  return age;
};
