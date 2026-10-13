import { pickDisplayStats, relativeFill, formatStatValue } from "../../lib/stats.js";
import cuteAnimals from "../../data/cute-animals.js";
import { CUTE_FONT_CSS } from "../../data/embedded-fonts.js";
import { renderSticker } from "../sticker.js";
import { escapeXml, clamp, wrapText, secondaryDisplayName, truncate } from "../text.js";

const WIDTH = 600;
const HEIGHT = 320;
const DEFAULT_DISPLAY_WIDTH = 360;

const INK = "#5a3d35";
const MUTED = "#b08890";
const FONT_ROUND = "Fredoka, ui-rounded, 'Segoe UI', sans-serif";
const FONT_HANZI = "ZCOOL KuaiLe, Fredoka, sans-serif";

const LEFT = 30;
/** Left column width before the giant hanzi starts (~x 360). */
const COLUMN = 330;
const BAR_X = 110;
const BAR_W = 180;
const SPARKLE = "M10 0 Q11.5 8.5 20 10 Q11.5 11.5 10 20 Q8.5 11.5 0 10 Q8.5 8.5 10 0Z";

function sparkle(x, y, size, fill, { twinkle = false, begin = "0s" } = {}) {
  const anim = twinkle
    ? `<animate attributeName="opacity" values="1;0.25;1" dur="2.4s" begin="${begin}" repeatCount="indefinite"/>`
    : "";
  return `<path d="${SPARKLE}" transform="translate(${x} ${y}) scale(${size / 20})" fill="${fill}">${anim}</path>`;
}

/** Shrink a one-line label to fit (Fredoka ≈ 0.56em per glyph). */
function fitFontSize(text, maxWidth, base, em = 0.56) {
  const len = Math.max(1, String(text).length);
  return Math.min(base, Math.floor(maxWidth / (len * em)));
}

const CJK = /[ᄀ-ᇿ⺀-鿿가-힯豈-﫿＀-￯]/;

/** Rough rendered width: CJK ≈ 1em (system fallback), M/W ≈ 0.92em, other capitals ≈ 0.68em, m/w ≈ 0.8em, rest ≈ 0.55em. */
function textWidth(text, px) {
  let em = 0;
  for (const ch of String(text)) {
    if (CJK.test(ch)) em += 1;
    else if (/[MW]/.test(ch)) em += 0.92;
    else if (/[A-Z]/.test(ch)) em += 0.68;
    else if (/[mw]/.test(ch)) em += 0.8;
    else em += 0.55;
  }
  return em * px;
}

/** Fredoka's precomposed ī (U+012B) misplaces its macron; dotless ı + U+0304 renders correctly. */
function displayPinyin(pinyin) {
  return String(pinyin || "").replace(/ī/g, "ı̄");
}

/** Longest prefix (plus "…") that fits maxWidth. */
function fitText(text, px, maxWidth) {
  const s = String(text ?? "").trim();
  if (textWidth(s, px) <= maxWidth) return s;
  const chars = Array.from(s);
  while (chars.length > 1 && textWidth(`${chars.join("")}…`, px) > maxWidth) chars.pop();
  return `${chars.join("").trimEnd()}…`;
}

/** Up to two lines; "…" when the blurb still doesn't fit. */
function descriptionLines(text) {
  const full = String(text || "").trim();
  const lines = wrapText(full, 50, 2);
  if (lines.length && lines.join(" ").length < full.length) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].replace(/[.,;:!?]$/, "")}…`;
  }
  return lines;
}

/** Login + (real name · role); drops role, then real name, before overflowing the column. */
function renderNameLine(profile) {
  const login = fitText(truncate(profile.username || profile.name || "developer", 22), 20, COLUMN);
  let parts = [
    truncate(secondaryDisplayName(profile), 16),
    truncate(profile.role || "Software Developer", 20),
  ].filter(Boolean);
  const avail = COLUMN - textWidth(login, 20) - 8;
  while (parts.length > 1 && textWidth(parts.join(" · "), 13) > avail) parts.pop();
  if (avail < 40) parts = [];
  else if (parts.length) parts[0] = fitText(parts[0], 13, avail);
  const extras = parts.length
    ? `<tspan dx="8" fill="${MUTED}" font-size="13" font-weight="400">${parts.map(escapeXml).join(" · ")}</tspan>`
    : "";
  return `<text x="${LEFT}" y="152" fill="${INK}" font-size="20" font-weight="600" font-family="${FONT_ROUND}">${escapeXml(login)}${extras}</text>`;
}

function renderLanguages(languages, c) {
  const top = (languages || []).slice(0, 3).map((l) => l?.name).filter(Boolean);
  if (!top.length) return "";
  const avail = COLUMN - 18;
  while (top.length > 1 && textWidth(top.join(" · "), 14) > avail) top.pop();
  const label = fitText(top.join(" · "), 14, avail);
  return `<g class="languages">
      ${sparkle(LEFT, 165, 12, c.accent)}
      <text x="${LEFT + 18}" y="176" fill="${c.accent}" font-size="14" font-weight="600" font-family="${FONT_ROUND}">${escapeXml(label)}</text>
    </g>`;
}

function renderStats(displayStats, c) {
  const peak = Math.max(0, ...displayStats.map((s) => Number(s.value) || 0));
  return displayStats
    .map((stat, i) => {
      const y = 210 + i * 28;
      const w = relativeFill(stat.value, peak, BAR_W);
      const fill =
        w > 0
          ? `<rect class="bar-fill" x="${BAR_X}" y="${y - 12}" width="${w}" height="14" rx="${Math.min(7, w / 2)}" fill="${c.accent}"/>`
          : "";
      return `
    <text x="${LEFT}" y="${y}" fill="${INK}" font-size="15" font-family="${FONT_ROUND}">${escapeXml(stat.label)}</text>
    <rect x="${BAR_X}" y="${y - 12}" width="${BAR_W}" height="14" rx="7" fill="${c.mid}"/>
    ${fill}
    <text x="${BAR_X + BAR_W + 10}" y="${y}" fill="${INK}" font-size="15" font-weight="600" font-family="${FONT_ROUND}">${escapeXml(formatStatValue(stat.value))}</text>`;
    })
    .join("");
}

/** Giant pastel hanzi, sticker character on top, sparkles, and the pinyin tag. */
function renderHero(zodiac, c, glow) {
  const hanzi = escapeXml(zodiac.hanzi || zodiac.earthlyBranch || "");
  const def = cuteAnimals[zodiac.id];
  return `
    <text x="470" y="236" text-anchor="middle" font-size="230" fill="${c.mid}" font-family="${FONT_HANZI}">${hanzi}</text>
    <g class="character" transform="translate(395 100) scale(1.25)">${def ? renderSticker(def) : ""}</g>
    ${sparkle(538, 34, 22, "#ffd36e", { twinkle: glow })}
    ${sparkle(384, 92, 16, "#ffd36e", { twinkle: glow, begin: "0.8s" })}
    ${sparkle(556, 196, 14, c.accent, { twinkle: glow, begin: "1.6s" })}
    <g transform="translate(392 256)">
      <rect width="156" height="30" rx="15" fill="#ffffff" stroke="${INK}" stroke-width="2.5"/>
      <text x="78" y="21" text-anchor="middle" fill="${INK}" font-size="15" font-family="${FONT_ROUND}"><tspan fill="${c.accent}" font-size="17" font-family="${FONT_HANZI}">${hanzi}</tspan> ${escapeXml(displayPinyin(zodiac.pinyin))} · “${escapeXml(zodiac.sign.toLowerCase())}”</text>
    </g>`;
}

/**
 * @param {{ profile: object, zodiac: object, stats: object, meta?: { source?: string, width?: number, glow?: boolean } }} input
 */
export function renderCuteCard({ profile, zodiac, stats, meta = {} }) {
  const c = zodiac.cuteColors;
  const uid = `azc-${profile.username}-${zodiac.id}`.replace(/[^a-z0-9-]/gi, "");
  const displayStats = pickDisplayStats(stats, zodiac, 3);
  const login = profile.username || profile.name || "developer";
  const realName = secondaryDisplayName(profile);
  const nameLabel = realName ? `${login} (${realName})` : login;
  const glow = Boolean(meta.glow);

  const displayWidth = clamp(Number(meta.width) || DEFAULT_DISPLAY_WIDTH, 240, 900);
  const displayHeight = Math.round((displayWidth / WIDTH) * HEIGHT);

  const title = zodiac.title.replace(/^The\s+/i, "");
  const titleSize = fitFontSize(title, COLUMN, 28);
  // Branch glyph uses the embedded hanzi face — Fredoka has no CJK.
  const year = `${escapeXml(`YEAR OF THE ${zodiac.sign.toUpperCase()}`)}${
    zodiac.earthlyBranch
      ? ` · <tspan font-family="${FONT_HANZI}">${escapeXml(zodiac.earthlyBranch)}</tspan>`
      : ""
  }`;
  const source = meta.source === "birthdate" ? "by birth year" : "by name-seed";
  const description = descriptionLines(zodiac.description)
    .map(
      (line, i) =>
        `<text x="${LEFT}" y="${106 + i * 17}" fill="${MUTED}" font-size="13" font-family="${FONT_ROUND}">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(nameLabel)} Asian Zodiac Card">
  <title>${escapeXml(nameLabel)} — ${escapeXml(zodiac.sign)} ${escapeXml(zodiac.title)}</title>
  <defs>
    <pattern id="${uid}-dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2" fill="${c.mid}"/>
    </pattern>
    <clipPath id="${uid}-clip">
      <rect x="3" y="3" width="594" height="314" rx="26"/>
    </clipPath>
    <style>
${CUTE_FONT_CSS}
    </style>
  </defs>

  <rect x="3" y="3" width="594" height="314" rx="26" fill="${c.bg}"/>
  <g clip-path="url(#${uid}-clip)">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#${uid}-dots)" opacity="0.55"/>
    ${renderHero(zodiac, c, glow)}

    <text x="${LEFT}" y="46" fill="${c.accent}" font-size="15" font-weight="600" letter-spacing="1" font-family="${FONT_ROUND}">${year}</text>
    <text x="${LEFT}" y="82" fill="${INK}" font-size="${titleSize}" font-weight="600" font-family="${FONT_ROUND}">${escapeXml(title)}</text>
    ${description}
    ${renderNameLine(profile)}
    ${renderLanguages(profile.languages, c)}
    ${renderStats(displayStats, c)}

    <text x="${LEFT}" y="300" fill="${MUTED}" font-size="12" font-family="${FONT_ROUND}">Your coding personality written in the Asian zodiac</text>
    <text x="570" y="300" text-anchor="end" fill="${MUTED}" font-size="12" font-family="${FONT_ROUND}">${escapeXml(`${zodiac.element} · ${source}`)}</text>
  </g>
  <rect x="3" y="3" width="594" height="314" rx="26" fill="none" stroke="${c.mid}" stroke-width="3"/>
</svg>`;
}
