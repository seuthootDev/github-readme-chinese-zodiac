import { seededRandom } from "./zodiac.js";

const FALLBACK_LANGUAGES = ["Python", "TypeScript", "Go", "Rust", "Shell", "SQL"];

/** Short enough to fit two lines of the speech bubble. */
const ADVICE = [
  "Good day to close old issues.",
  "Refactor that function you keep avoiding.",
  "A small PR today saves a big one tomorrow.",
  "Write the test first — the stars insist.",
  "Delete dead code. It will not be missed.",
  "Read the error message twice before googling.",
  "Pair with someone; two orbits beat one.",
  "Ship it, then polish it.",
  "Name things clearly. Future you is watching.",
  "Update that README. Strangers will thank you.",
  "Your next bug is a typo. Check the spelling.",
  "Take a walk before the hard merge.",
  "Commit early, commit often.",
  "Today favors small, boring, working changes.",
  "Star a repo that helped you this week.",
  "Leave a kind review comment.",
  "Pin your dependencies before they drift.",
  "Rubber-duck the problem out loud.",
  "Answer one open question in your issues.",
  "A fresh branch brings fresh luck.",
  "Avoid force-pushing to main today.",
  "Old TODOs want attention. Pick one.",
  "Log more, guess less.",
  "Try the language you keep bookmarking.",
];

function utcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Daily "dev horoscope" — deterministic per user, sign and UTC day.
 * @param {{ username: string, signId: string, languages?: {name: string}[], date?: Date }} input
 */
export function dailyForecast({ username, signId, languages = [], date = new Date() }) {
  const dayKey = utcDateKey(date);
  const rand = seededRandom(`${username}|${signId}|${dayKey}`.toLowerCase());

  const own = languages.slice(0, 5).map((l) => l.name).filter(Boolean);
  const pool = own.length ? own : FALLBACK_LANGUAGES;
  const luckyLanguage = pool[Math.floor(rand() * pool.length)];
  const advice = ADVICE[Math.floor(rand() * ADVICE.length)];

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return { luckyLanguage, advice, dateLabel, dayKey };
}
