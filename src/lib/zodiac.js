import animals from "../data/animals.js";

/** Order: Rat … Pig. Year formula: (year - 4) % 12 → Rat at 1984, 1996, … */
const ANIMAL_ORDER = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig",
];

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Approximate Chinese New Year boundary:
 * before Feb 4 → previous animal year (good enough for profile cards).
 */
function animalYearFromBirthdate(birthdate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate ?? "");
  if (!match) return null;
  let year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (month < 2 || (month === 2 && day < 4)) year -= 1;
  return year;
}

export function getAllSigns() {
  return animals;
}

export function getSignById(id) {
  return animals.find((s) => s.id === id) ?? null;
}

export function signFromBirthYear(year) {
  if (!Number.isFinite(year)) return null;
  const idx = ((year - 4) % 12 + 12) % 12;
  return getSignById(ANIMAL_ORDER[idx]);
}

export function signFromBirthdate(birthdate) {
  const year = animalYearFromBirthdate(birthdate);
  if (year == null) return null;
  return signFromBirthYear(year);
}

/** Deterministic animal when birthdate is omitted. */
export function signFromUsername(username) {
  const idx = hashString(username.toLowerCase()) % ANIMAL_ORDER.length;
  return getSignById(ANIMAL_ORDER[idx]);
}

export function resolveZodiac({ username, birthdate, sign } = {}) {
  if (sign) {
    const forced = getSignById(String(sign).toLowerCase());
    if (forced) return { zodiac: forced, source: "param" };
  }
  const fromBirth = signFromBirthdate(birthdate);
  if (fromBirth) return { zodiac: fromBirth, source: "birthdate" };
  return { zodiac: signFromUsername(username || "guest"), source: "username" };
}

export function seededRandom(seed) {
  let state = hashString(String(seed)) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
