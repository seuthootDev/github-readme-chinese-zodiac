/**
 * Sexagenary (干支) year → the "colored animal" of the year, e.g. 丙午 = red horse.
 * The heavenly stem's element gives the color: wood blue, fire red, earth gold, metal white, water black.
 */

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const SIGN_IDS = [
  "rat", "ox", "tiger", "rabbit", "dragon", "snake",
  "horse", "goat", "monkey", "rooster", "dog", "pig",
];
/** Indexed by Math.floor(stemIndex / 2). */
const ELEMENT_COLORS = ["blue", "red", "gold", "white", "black"];
const COLOR_WORDS = { blue: "BLUE", red: "RED", gold: "GOLDEN", white: "WHITE", black: "BLACK" };

const mod = (n, m) => ((n % m) + m) % m;

/** Zodiac year for a date (UTC); before Feb 4 (입춘) still counts as the previous year. */
export function yearGanzhi(date = new Date()) {
  let year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (month < 2 || (month === 2 && date.getUTCDate() < 4)) year -= 1;
  const stem = mod(year - 4, 10);
  const branch = mod(year - 4, 12);
  return {
    year,
    ganzhi: STEMS[stem] + BRANCHES[branch],
    signId: SIGN_IDS[branch],
    color: ELEMENT_COLORS[Math.floor(stem / 2)],
  };
}

/** Year mark for a card of `signId`, or null when that animal does not rule the current year. */
export function yearMarkFor(signId, date = new Date()) {
  const g = yearGanzhi(date);
  if (!signId || g.signId !== signId) return null;
  return { ...g, label: `${COLOR_WORDS[g.color]} ${g.signId.toUpperCase()} YEAR` };
}
