import { pickDisplayStats } from "../lib/stats.js";

const WIDTH = 600;
const HEIGHT = 320;
const DEFAULT_DISPLAY_WIDTH = 360;

/** Inline stacks — GitHub Camo often strips <style>/@import. */
const FONT_CLASSICAL =
  "ZCOOL XiaoWei, Noto Serif SC, Songti SC, STSong, serif";
const FONT_TITLE = "Noto Serif SC, Source Serif 4, Georgia, serif";
const FONT_BODY = "Source Serif 4, Noto Serif SC, Georgia, serif";

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function barWidth(value, max = 150) {
  return Math.round((clamp(value) / 100) * max);
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function wrapText(text, maxChars, maxLines = 3) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

/**
 * Bare classical hanzi where the Western card shows a constellation.
 * Optional glow (meta.glow): soft halo + twinkle on the *large* glyph only.
 * Branch stays static. Default off for GitHub Camo safety.
 */
function renderHanziEmblem(zodiac, { glow = false } = {}) {
  const hanzi = zodiac.hanzi || zodiac.earthlyBranch || "生";
  const branch = zodiac.earthlyBranch || "";
  const h = escapeXml(hanzi);
  // Halo via stacked text (no feGaussianBlur — survives Camo better when glow is on)
  const halo = glow
    ? `<text x="168" y="120" text-anchor="middle" fill="#ffffff" font-size="112" font-family="${FONT_CLASSICAL}" opacity="0.18">${h}</text>
      <text x="168" y="120" text-anchor="middle" fill="#ffffff" font-size="108" font-family="${FONT_CLASSICAL}" opacity="0.28">${h}</text>`
    : "";
  const twinkle = glow
    ? `<animate attributeName="opacity" values="0.42;1;0.55;0.95;0.42" dur="3.2s" begin="0s" repeatCount="indefinite"/>`
    : "";
  return `
    <g transform="translate(310, 8)" aria-hidden="true">
      ${halo}
      <text
        x="168"
        y="120"
        text-anchor="middle"
        fill="#ffffff"
        font-size="104"
        font-family="${FONT_CLASSICAL}"
        opacity="${glow ? "0.92" : "0.88"}"
      >${h}${twinkle}</text>
      ${
        branch
          ? `<text
        x="168"
        y="168"
        text-anchor="middle"
        fill="#ffffff"
        font-size="28"
        letter-spacing="6"
        font-family="${FONT_CLASSICAL}"
        opacity="0.7"
      >${escapeXml(branch)}</text>`
          : ""
      }
    </g>`;
}

/** Blurb under the hanzi — same role as western text under the constellation. */
function renderDescription(zodiac, colors) {
  const lines = wrapText(zodiac.description, 34, 3);
  if (!lines.length) return "";
  return lines
    .map((line, i) => {
      const prefix = i === 0 ? "卷 " : "   ";
      const y = 200 + i * 17;
      return `<text x="340" y="${y}" fill="${colors.muted}" font-size="12" font-family="${FONT_BODY}">${prefix}${escapeXml(line)}</text>`;
    })
    .join("\n    ");
}

function renderStatBars(displayStats, colors) {
  return displayStats
    .map((stat, i) => {
      const y = 200 + i * 26;
      const w = barWidth(stat.value);
      return `
      <text x="36" y="${y}" fill="${colors.muted}" font-size="12" font-family="${FONT_BODY}">${escapeXml(stat.label)}</text>
      <rect x="140" y="${y - 10}" width="150" height="7" fill="${colors.text}" opacity="0.08"/>
      <rect x="140" y="${y - 10}" width="${w}" height="7" fill="${colors.bar}"/>
      <text x="300" y="${y}" fill="${colors.text}" font-size="12" font-family="${FONT_BODY}" opacity="0.85">${stat.value}</text>`;
    })
    .join("");
}

function renderLanguages(languages, colors) {
  const top = (languages || []).slice(0, 3).map((l) => l.name);
  if (!top.length) return "";
  const label = top.join("  ·  ");
  return `<text x="36" y="168" fill="${colors.accent}" font-size="12" letter-spacing="0.4" font-family="${FONT_BODY}">${escapeXml(label)}</text>`;
}

/**
 * @param {{ profile: object, zodiac: object, stats: object, meta?: { source?: string, width?: number, glow?: boolean } }} input
 */
export function renderZodiacCard({ profile, zodiac, stats, meta = {} }) {
  const colors = zodiac.colors;
  const displayStats = pickDisplayStats(stats, zodiac, 3);
  const displayName = profile.name || profile.username;
  const role = profile.role || "Software Developer";
  const uid = `az-${profile.username}-${zodiac.id}`.replace(/[^a-z0-9-]/gi, "");
  const sourceLabel =
    meta.source === "birthdate"
      ? "mapped by birth year"
      : "mapped by name-seed";
  const glow = Boolean(meta.glow);

  const displayWidth = clamp(
    Number(meta.width) || DEFAULT_DISPLAY_WIDTH,
    240,
    900,
  );
  const displayHeight = Math.round((displayWidth / WIDTH) * HEIGHT);
  const elementLine = [zodiac.hanzi, zodiac.element, zodiac.earthlyBranch]
    .filter(Boolean)
    .join(" · ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(displayName)} Asian Zodiac Card">
  <title>${escapeXml(displayName)} — ${escapeXml(zodiac.sign)} ${escapeXml(zodiac.title)}</title>
  <defs>
    <linearGradient id="${uid}-bg" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${colors.bg0}"/>
      <stop offset="55%" stop-color="${colors.bg1}"/>
      <stop offset="100%" stop-color="#12080a"/>
    </linearGradient>
    <radialGradient id="${uid}-glow" cx="72%" cy="32%" r="42%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${colors.bg0}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${uid}-clip">
      <rect width="${WIDTH}" height="${HEIGHT}" rx="6"/>
    </clipPath>
  </defs>

  <g clip-path="url(#${uid}-clip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-glow)"/>

    ${renderHanziEmblem(zodiac, { glow })}
    ${renderDescription(zodiac, colors)}

    <text x="36" y="52" fill="${colors.accent}" font-size="22" font-weight="700" letter-spacing="2" font-family="${FONT_TITLE}">
      ${escapeXml(zodiac.symbol)}  ${escapeXml(zodiac.sign.toUpperCase())}
    </text>
    <text x="36" y="82" fill="${colors.text}" font-size="22" opacity="0.95" font-family="${FONT_CLASSICAL}">
      ${escapeXml(zodiac.title.replace(/^The\s+/i, ""))}
    </text>
    <text x="36" y="102" fill="${colors.muted}" font-size="11" letter-spacing="1" font-family="${FONT_BODY}">
      ${escapeXml(elementLine)}
    </text>

    <text x="36" y="128" fill="${colors.text}" font-size="18" font-weight="600" font-family="${FONT_BODY}">
      ${escapeXml(displayName)}
    </text>
    <text x="36" y="148" fill="${colors.muted}" font-size="12" font-family="${FONT_BODY}">
      ${escapeXml(role)}
    </text>

    ${renderLanguages(profile.languages, colors)}
    ${renderStatBars(displayStats, colors)}

    <text x="36" y="298" fill="${colors.accent}" font-size="11" opacity="0.9" font-family="${FONT_BODY}">
      印 Your coding personality written in the Asian zodiac
    </text>
    <text x="560" y="298" text-anchor="end" fill="${colors.muted}" font-size="10" opacity="0.55" font-family="${FONT_BODY}">
      ${escapeXml(sourceLabel)}
    </text>
  </g>
</svg>`;
}

export const CARD_SIZE = {
  width: WIDTH,
  height: HEIGHT,
  defaultDisplayWidth: DEFAULT_DISPLAY_WIDTH,
};
