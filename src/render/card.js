import { pickDisplayStats } from "../lib/stats.js";
import { seededRandom } from "../lib/zodiac.js";

const WIDTH = 600;
const HEIGHT = 320;
const DEFAULT_DISPLAY_WIDTH = 360;

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

/** Soft ink / paper speckles — not a starfield */
function renderInkWash(seed, color) {
  const rand = seededRandom(`ink-${seed}`);
  const parts = [];
  for (let i = 0; i < 28; i++) {
    const x = 20 + rand() * (WIDTH - 40);
    const y = 20 + rand() * (HEIGHT - 40);
    const rx = 8 + rand() * 28;
    const ry = 4 + rand() * 14;
    const opacity = 0.03 + rand() * 0.07;
    parts.push(
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`,
    );
  }
  return parts.join("");
}

/** Simplified 祥云 (auspicious cloud) motifs */
function renderClouds(colors) {
  const stroke = colors.accent;
  return `
    <g fill="none" stroke="${stroke}" stroke-width="1.2" opacity="0.35">
      <path d="M420 52c12-14 28-14 40 0 14-10 30-6 36 10-16 4-28 14-40 14-18 0-28-10-36-24z"/>
      <path d="M500 88c10-12 24-12 34 0 12-8 26-4 30 8-14 4-24 12-34 12-14 0-24-8-30-20z"/>
      <path d="M390 110c10-10 22-8 30 2 10-8 22-4 26 8-12 2-20 10-28 10-14 0-22-8-28-20z"/>
    </g>`;
}

function renderFrame(colors, uid) {
  const gold = colors.accent;
  return `
    <rect x="10" y="10" width="580" height="300" rx="4" fill="none" stroke="${gold}" stroke-opacity="0.55" stroke-width="1.5"/>
    <rect x="16" y="16" width="568" height="288" rx="2" fill="none" stroke="${gold}" stroke-opacity="0.25" stroke-width="1"/>
    <!-- corner knots -->
    <g stroke="${gold}" stroke-width="1.4" fill="none" opacity="0.7">
      <path d="M22 34 V22 H34"/>
      <path d="M578 34 V22 H566"/>
      <path d="M22 286 V298 H34"/>
      <path d="M578 286 V298 H566"/>
    </g>
    <defs>
      <linearGradient id="${uid}-silk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${gold}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${gold}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="${gold}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="80" y="28" width="200" height="1" fill="url(#${uid}-silk)"/>
    <rect x="80" y="86" width="160" height="1" fill="url(#${uid}-silk)" opacity="0.7"/>`;
}

/** Red seal with earthly branch */
function renderSeal(zodiac, colors) {
  const branch = zodiac.earthlyBranch || "支";
  return `
    <g transform="translate(520, 40)">
      <rect x="0" y="0" width="52" height="52" rx="4" fill="#8b1e2d" stroke="${colors.accent}" stroke-width="1.5" opacity="0.92"/>
      <text x="26" y="36" text-anchor="middle" fill="#f5e6c8" font-size="26" font-family="'Noto Serif SC', 'Source Han Serif SC', serif" font-weight="700">${escapeXml(branch)}</text>
    </g>`;
}

function renderStatBars(displayStats, colors) {
  return displayStats
    .map((stat, i) => {
      const y = 200 + i * 26;
      const w = barWidth(stat.value);
      return `
      <text x="36" y="${y}" fill="${colors.muted}" font-size="12" font-family="'Noto Serif SC', Georgia, serif">${escapeXml(stat.label)}</text>
      <rect x="140" y="${y - 10}" width="150" height="7" fill="${colors.text}" opacity="0.08"/>
      <rect x="140" y="${y - 10}" width="${w}" height="7" fill="${colors.bar}">
        <animate attributeName="width" from="0" to="${w}" dur="0.9s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>
      </rect>
      <text x="300" y="${y}" fill="${colors.text}" font-size="12" font-family="Georgia, serif" opacity="0.85">${stat.value}</text>`;
    })
    .join("");
}

function renderLanguages(languages, colors) {
  const top = (languages || []).slice(0, 3).map((l) => l.name);
  if (!top.length) return "";
  const label = top.join("  ·  ");
  return `<text x="36" y="168" fill="${colors.accent}" font-size="12" font-family="'Noto Serif SC', Georgia, serif" letter-spacing="0.4">${escapeXml(label)}</text>`;
}

function renderDescription(zodiac, colors) {
  const lines = wrapText(zodiac.description, 32, 3);
  if (!lines.length) return "";
  return lines
    .map((line, i) => {
      const prefix = i === 0 ? "卷 " : "   ";
      const y = 150 + i * 17;
      return `<text class="body" x="340" y="${y}" fill="${colors.muted}" font-size="12">${prefix}${escapeXml(line)}</text>`;
    })
    .join("\n    ");
}

/**
 * @param {{ profile: object, zodiac: object, stats: object, meta?: { source?: string, width?: number } }} input
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
<svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(displayName)} Asian Zodiac Card">
  <title>${escapeXml(displayName)} — ${escapeXml(zodiac.sign)} ${escapeXml(zodiac.title)}</title>
  <defs>
    <linearGradient id="${uid}-bg" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${colors.bg0}"/>
      <stop offset="55%" stop-color="${colors.bg1}"/>
      <stop offset="100%" stop-color="#1a0a0c"/>
    </linearGradient>
    <radialGradient id="${uid}-glow" cx="20%" cy="15%" r="55%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${colors.bg0}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${uid}-clip">
      <rect width="${WIDTH}" height="${HEIGHT}" rx="6"/>
    </clipPath>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&amp;family=Noto+Serif+SC:wght@500;700&amp;family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&amp;display=swap');
      .title { font-family: 'Noto Serif SC', 'Source Serif 4', Georgia, serif; }
      .brush { font-family: 'Ma Shan Zheng', 'Noto Serif SC', serif; }
      .body { font-family: 'Source Serif 4', 'Noto Serif SC', Georgia, serif; }
    </style>
  </defs>

  <g clip-path="url(#${uid}-clip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-glow)"/>
    ${renderInkWash(`${profile.username}-${zodiac.id}`, colors.star)}
    ${renderFrame(colors, uid)}
    ${renderClouds(colors)}
    ${renderSeal(zodiac, colors)}

    <text class="brush" x="420" y="200" fill="${colors.accent}" font-size="72" opacity="0.12" text-anchor="middle">
      ${escapeXml(zodiac.hanzi || zodiac.earthlyBranch || "")}
    </text>

    <text class="title" x="36" y="52" fill="${colors.accent}" font-size="22" font-weight="700" letter-spacing="2">
      ${escapeXml(zodiac.symbol)}  ${escapeXml(zodiac.sign.toUpperCase())}
    </text>
    <text class="brush" x="36" y="82" fill="${colors.text}" font-size="22" opacity="0.95">
      ${escapeXml(zodiac.title.replace(/^The\s+/i, ""))}
    </text>
    <text class="body" x="36" y="102" fill="${colors.muted}" font-size="11" letter-spacing="1">
      ${escapeXml(elementLine)}
    </text>

    <text class="body" x="36" y="128" fill="${colors.text}" font-size="18" font-weight="600">
      ${escapeXml(displayName)}
    </text>
    <text class="body" x="36" y="148" fill="${colors.muted}" font-size="12">
      ${escapeXml(role)}
    </text>

    ${renderLanguages(profile.languages, colors)}
    ${renderDescription(zodiac, colors)}
    ${renderStatBars(displayStats, colors)}

    <text class="body" x="36" y="298" fill="${colors.accent}" font-size="11" opacity="0.9">
      印 Your coding personality written in the Asian zodiac
    </text>
    <text x="560" y="298" text-anchor="end" fill="${colors.muted}" font-size="10" font-family="Georgia, serif" opacity="0.55">
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
