function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function scale(value, softMax) {
  if (value <= 0) return 0;
  return clamp(100 * (1 - Math.exp(-value / softMax)));
}

/**
 * Fun developer traits from GitHub signals.
 * Keys stay stable; labels are Asian-zodiac flavored (not Western Consistency/Explorer…).
 */
export function calculateStats(profile) {
  const {
    publicRepos = 0,
    ageDays = 1,
    stars = 0,
    forks = 0,
    openIssues = 0,
    followers = 0,
    languages = [],
  } = profile;

  const reposPerYear = publicRepos / Math.max(ageDays / 365, 0.25);

  const consistency = scale(reposPerYear * 8 + Math.min(ageDays / 30, 40), 55);
  const explorer = scale(languages.length * 14 + publicRepos * 0.4, 50);
  const builder = scale(publicRepos * 3 + stars * 0.8 + forks * 1.2, 80);
  const openSource = scale(stars * 1.1 + forks * 2 + followers * 1.5, 90);
  const debuggerStat = scale(
    openIssues * 2.5 + publicRepos * 1.5 + stars * 0.3,
    70,
  );

  return {
    consistency,
    explorer,
    builder,
    openSource,
    debugger: debuggerStat,
  };
}

/** Display names for Asian zodiac cards / pins */
export const STAT_LABELS = {
  consistency: "Discipline",
  explorer: "Ingenuity",
  builder: "Craft",
  openSource: "Renown",
  debugger: "Insight",
};

export function pickDisplayStats(stats, zodiac, limit = 3) {
  const keys = zodiac.statKeys?.length
    ? zodiac.statKeys
    : ["consistency", "builder", "debugger"];

  return keys.slice(0, limit).map((key) => ({
    key,
    label: STAT_LABELS[key] || key,
    value: stats[key] ?? 0,
  }));
}
