import { pickDisplayStats } from "../lib/stats.js";

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

/**
 * Bare classical hanzi where the Western card shows a constellation —
 * no seal box / frame, white glyph that soft-twinkles.
 */
function renderHanziEmblem(zodiac, uid) {
  const hanzi = zodiac.hanzi || zodiac.earthlyBranch || "生";
  const branch = zodiac.earthlyBranch || "";
  return `
    <g transform="translate(310, 8)" aria-hidden="true">
      <defs>
        <filter id="${uid}-glyph-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- same stage as western constellation panel -->
      <text
        class="classical"
        x="168"
        y="145"
        text-anchor="middle"
        fill="#ffffff"
        font-size="118"
        filter="url(#${uid}-glyph-glow)"
        opacity="0.9"
      >${escapeXml(hanzi)}
        <animate attributeName="opacity" values="0.35;1;0.5;0.92;0.35" dur="3.2s" begin="0s" repeatCount="indefinite"/>
      </text>
      ${
        branch
          ? `<text
        class="classical"
        x="168"
        y="205"
        text-anchor="middle"
        fill="#ffffff"
        font-size="30"
        letter-spacing="6"
        opacity="0.72"
      >${escapeXml(branch)}
        <animate attributeName="opacity" values="0.22;0.88;0.35;0.78;0.22" dur="3.9s" begin="0.55s" repeatCount="indefinite"/>
      </text>`
          : ""
      }
    </g>`;
}

function renderStatBars(displayStats, colors) {
  return displayStats
    .map((stat, i) => {
      const y = 200 + i * 26;
      const w = barWidth(stat.value);
      return `
      <text class="body" x="36" y="${y}" fill="${colors.muted}" font-size="12">${escapeXml(stat.label)}</text>
      <rect x="140" y="${y - 10}" width="150" height="7" fill="${colors.text}" opacity="0.08"/>
      <rect x="140" y="${y - 10}" width="${w}" height="7" fill="${colors.bar}">
        <animate attributeName="width" from="0" to="${w}" dur="0.9s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>
      </rect>
      <text class="body" x="300" y="${y}" fill="${colors.text}" font-size="12" opacity="0.85">${stat.value}</text>`;
    })
    .join("");
}

function renderLanguages(languages, colors) {
  const top = (languages || []).slice(0, 3).map((l) => l.name);
  if (!top.length) return "";
  const label = top.join("  ·  ");
  return `<text class="body" x="36" y="168" fill="${colors.accent}" font-size="12" letter-spacing="0.4">${escapeXml(label)}</text>`;
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
      <stop offset="100%" stop-color="#12080a"/>
    </linearGradient>
    <radialGradient id="${uid}-glow" cx="72%" cy="32%" r="42%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${colors.bg0}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${uid}-clip">
      <rect width="${WIDTH}" height="${HEIGHT}" rx="6"/>
    </clipPath>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&amp;family=Noto+Serif+SC:wght@500;700&amp;family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&amp;display=swap');
      .classical { font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', 'Songti SC', serif; }
      .title { font-family: 'Noto Serif SC', 'Source Serif 4', Georgia, serif; }
      .body { font-family: 'Source Serif 4', 'Noto Serif SC', Georgia, serif; }
    </style>
  </defs>

  <g clip-path="url(#${uid}-clip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-bg)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-glow)"/>

    ${renderHanziEmblem(zodiac, uid)}

    <text class="title" x="36" y="52" fill="${colors.accent}" font-size="22" font-weight="700" letter-spacing="2">
      ${escapeXml(zodiac.symbol)}  ${escapeXml(zodiac.sign.toUpperCase())}
    </text>
    <text class="classical" x="36" y="82" fill="${colors.text}" font-size="22" opacity="0.95">
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
    ${renderStatBars(displayStats, colors)}

    <text class="body" x="36" y="298" fill="${colors.accent}" font-size="11" opacity="0.9">
      印 Your coding personality written in the Asian zodiac
    </text>
    <text class="body" x="560" y="298" text-anchor="end" fill="${colors.muted}" font-size="10" opacity="0.55">
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
