import { pickDisplayStats } from "../lib/stats.js";
import animalIcons from "../data/animal-icons.js";
import animalGoldIcons from "../data/animal-gold-icons.js";

const WIDTH = 600;
const HEIGHT = 320;
const DEFAULT_DISPLAY_WIDTH = 360;

/**
 * Unified brush stack — same face as DRAGON / Vision Architect.
 * Google Fonts via <style>@import for live SVG; Camo may strip it.
 */
const FONT_BRUSH =
  "Ma Shan Zheng, ZCOOL XiaoWei, Noto Serif SC, Songti SC, serif";
const FONT_CLASSICAL = FONT_BRUSH;
const FONT_TITLE = FONT_BRUSH;
const FONT_BODY = FONT_BRUSH;

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
 * Gold paper-cut animal as a centered background watermark (under text / hanzi).
 * Keeps original gold color; low opacity so it stays atmospheric.
 */
function renderGoldBackground(zodiac) {
  const icon = animalGoldIcons[zodiac.id];
  if (!icon) return "";
  const size = 280;
  const x = (WIDTH - size) / 2;
  const y = (HEIGHT - size) / 2 - 4;
  return `
    <image
      href="${icon}"
      x="${x}"
      y="${y}"
      width="${size}"
      height="${size}"
      opacity="0.28"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    />`;
}

/** Gold double frame + corner brackets (trial — vermilion card skin). */
function renderGoldFrame(colors) {
  const a = colors.accent;
  const corner = (x, y, dx, dy) =>
    `<path d="M${x},${y + dy * 14} L${x},${y} L${x + dx * 14},${y}" fill="none" stroke="${a}" stroke-width="1.6" opacity="0.7"/>`;
  return `
    <rect x="10" y="10" width="580" height="300" fill="none" stroke="${a}" stroke-width="1.25" opacity="0.55"/>
    <rect x="14" y="14" width="572" height="292" fill="none" stroke="${a}" stroke-width="0.5" opacity="0.28"/>
    ${corner(18, 18, 1, 1)}
    ${corner(582, 18, -1, 1)}
    ${corner(18, 302, 1, -1)}
    ${corner(582, 302, -1, -1)}`;
}

/**
 * Bare classical hanzi where the Western card shows a constellation.
 * Optional glow (meta.glow): blur halo + opacity twinkle on the *large* glyph only.
 * Branch stays static. Default off for GitHub Camo safety.
 */
function renderHanziEmblem(zodiac, colors, uid, { glow = false } = {}) {
  const hanzi = zodiac.hanzi || zodiac.earthlyBranch || "生";
  const branch = zodiac.earthlyBranch || "";
  const h = escapeXml(hanzi);
  const filterDefs = glow
    ? `<defs>
        <filter id="${uid}-glyph-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>`
    : "";
  const filterAttr = glow ? ` filter="url(#${uid}-glyph-glow)"` : "";
  const twinkle = glow
    ? `<animate attributeName="opacity" values="0.35;1;0.5;0.92;0.35" dur="3.2s" begin="0s" repeatCount="indefinite"/>`
    : "";
  return `
    <g transform="translate(310, 8)" aria-hidden="true">
      ${filterDefs}
      <circle cx="168" cy="92" r="72" fill="none" stroke="${colors.accent}" stroke-width="1.2" opacity="0.28"/>
      <circle cx="168" cy="92" r="64" fill="${colors.accent}" opacity="0.06"/>
      <text
        x="168"
        y="120"
        text-anchor="middle"
        fill="#ffffff"
        font-size="104"
        font-family="${FONT_CLASSICAL}"
        opacity="${glow ? "0.9" : "0.88"}"${filterAttr}
      >${h}${twinkle}</text>
      ${
        branch
          ? `<text
        x="168"
        y="168"
        text-anchor="middle"
        fill="#ffffff"
        font-size="32"
        letter-spacing="4"
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
      const y = 198 + i * 19;
      return `<text x="340" y="${y}" fill="${colors.muted}" font-size="16" font-family="${FONT_BODY}">${prefix}${escapeXml(line)}</text>`;
    })
    .join("\n    ");
}

function renderStatBars(displayStats, colors) {
  return displayStats
    .map((stat, i) => {
      const y = 202 + i * 28;
      const w = barWidth(stat.value);
      return `
      <text x="36" y="${y}" fill="${colors.muted}" font-size="16" font-family="${FONT_BODY}">${escapeXml(stat.label)}</text>
      <rect x="140" y="${y - 11}" width="150" height="7" fill="${colors.text}" opacity="0.1"/>
      <rect x="140" y="${y - 11}" width="${w}" height="7" fill="${colors.bar}"/>
      <rect x="140" y="${y - 11}" width="${w}" height="1.5" fill="#ffffff" opacity="0.18"/>
      <text x="300" y="${y}" fill="${colors.text}" font-size="16" font-family="${FONT_BODY}" opacity="0.85">${stat.value}</text>`;
    })
    .join("");
}

function renderLanguages(languages, colors) {
  const top = (languages || []).slice(0, 3).map((l) => l.name);
  if (!top.length) return "";
  const label = top.join("  ·  ");
  return `<text x="36" y="174" fill="${colors.accent}" font-size="16" letter-spacing="0.3" font-family="${FONT_BODY}">${escapeXml(label)}</text>`;
}

/** Paper-cut animal icon — tinted to accent via mask; falls back to emoji. */
function renderAnimalTitle(zodiac, colors, uid) {
  const icon = animalIcons[zodiac.id];
  const label = escapeXml(zodiac.sign.toUpperCase());
  if (!icon) {
    return `<text x="36" y="54" fill="${colors.accent}" font-size="30" font-weight="700" letter-spacing="1" font-family="${FONT_TITLE}">
      ${escapeXml(zodiac.symbol)}  ${label}
    </text>`;
  }
  const size = 34;
  const x = 36;
  const y = 20;
  return `
    <mask id="${uid}-animal" maskUnits="userSpaceOnUse" x="${x}" y="${y}" width="${size}" height="${size}">
      <image href="${icon}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
    </mask>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${colors.accent}" mask="url(#${uid}-animal)"/>
    <text x="${x + size + 10}" y="54" fill="${colors.accent}" font-size="30" font-weight="700" letter-spacing="1" font-family="${FONT_TITLE}">${label}</text>`;
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
    <linearGradient id="${uid}-bg" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${colors.bg1}"/>
      <stop offset="48%" stop-color="${colors.bg0}"/>
      <stop offset="100%" stop-color="#080304"/>
    </linearGradient>
    <radialGradient id="${uid}-glow" cx="78%" cy="28%" r="48%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="${colors.bg1}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${colors.bg0}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${uid}-clip">
      <rect width="${WIDTH}" height="${HEIGHT}" rx="4"/>
    </clipPath>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&amp;family=ZCOOL+XiaoWei&amp;family=Noto+Serif+SC:wght@400;600;700&amp;display=swap');
    </style>
  </defs>

  <g clip-path="url(#${uid}-clip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-glow)"/>
    ${renderGoldBackground(zodiac)}
    ${renderGoldFrame(colors)}

    ${renderHanziEmblem(zodiac, colors, uid, { glow })}
    ${renderDescription(zodiac, colors)}

    ${renderAnimalTitle(zodiac, colors, uid)}
    <text x="36" y="88" fill="${colors.text}" font-size="28" opacity="0.95" font-family="${FONT_CLASSICAL}">
      ${escapeXml(zodiac.title.replace(/^The\s+/i, ""))}
    </text>
    <text x="36" y="112" fill="${colors.muted}" font-size="15" letter-spacing="0.4" font-family="${FONT_BODY}">
      ${escapeXml(elementLine)}
    </text>

    <text x="36" y="138" fill="${colors.text}" font-size="22" font-weight="600" font-family="${FONT_BODY}">
      ${escapeXml(displayName)}
    </text>
    <text x="36" y="158" fill="${colors.muted}" font-size="16" font-family="${FONT_BODY}">
      ${escapeXml(role)}
    </text>

    ${renderLanguages(profile.languages, colors)}
    ${renderStatBars(displayStats, colors)}

    <g opacity="0.85" aria-hidden="true">
      <circle cx="52" cy="292" r="11" fill="none" stroke="${colors.accent}" stroke-width="1.1"/>
      <text x="52" y="296" text-anchor="middle" fill="${colors.accent}" font-size="12" font-family="${FONT_CLASSICAL}">印</text>
    </g>
    <text x="70" y="298" fill="${colors.accent}" font-size="15" opacity="0.9" font-family="${FONT_BODY}">
      Your coding personality written in the Asian zodiac
    </text>
    <text x="560" y="298" text-anchor="end" fill="${colors.muted}" font-size="13" opacity="0.55" font-family="${FONT_BODY}">
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
