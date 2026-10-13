/**
 * Download a Google Fonts subset (woff2) and write src/data/embedded-fonts.js
 * so SVG <img> embeds can use the face (external @import is blocked in <img>).
 *
 * Usage: node scripts/embed-fonts.js
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import animals from "../src/data/animals.js";
import { STAT_LABELS } from "../src/lib/stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/embedded-fonts.js");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const STATIC_UI = [
  "Your coding personality written in the Asian zodiac",
  "Water",
  "Earth",
  "Wood",
  "Fire",
  "Metal",
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig",
  "印",
  "—",
  "–",
  "’",
  "‘",
  "“",
  "”",
  "…",
];

function collectText() {
  const chars = new Set();
  for (let i = 0x20; i <= 0x7e; i++) chars.add(String.fromCharCode(i));
  for (const s of STATIC_UI) for (const c of s) chars.add(c);
  for (const label of Object.values(STAT_LABELS)) for (const c of label) chars.add(c);
  for (const a of animals) {
    for (const key of ["title", "description", "hanzi", "earthlyBranch", "sign", "element"]) {
      for (const c of String(a[key] || "")) chars.add(c);
    }
  }
  return [...chars].sort().join("");
}

/** Latin text the cute card can draw (Fredoka subset). */
const CUTE_STATIC_UI = [
  "YEAR OF THE",
  "Your coding personality written in the Asian zodiac",
  "by birth year",
  "by name-seed",
  "·",
  "…",
  "“",
  "”",
];

function collectCuteLatinText() {
  const chars = new Set();
  for (let i = 0x20; i <= 0x7e; i++) chars.add(String.fromCharCode(i));
  for (const s of CUTE_STATIC_UI) for (const c of s) chars.add(c);
  for (const label of Object.values(STAT_LABELS)) for (const c of label) chars.add(c);
  for (const a of animals) {
    for (const key of ["title", "description", "sign", "element", "pinyin"]) {
      for (const c of String(a[key] || "")) chars.add(c);
    }
  }
  return [...chars].sort().join("");
}

/** Hanzi + earthly branches only (ZCOOL KuaiLe subset). */
function collectHanziText() {
  const chars = new Set();
  for (const a of animals) {
    for (const c of `${a.hanzi || ""}${a.earthlyBranch || ""}`) chars.add(c);
  }
  return [...chars].sort().join("");
}

/**
 * Parse @font-face blocks from Google CSS; return { family, weight, style, unicodeRange, url }[]
 */
function parseFontFaces(css) {
  const faces = [];
  const blocks = css.split("@font-face").slice(1);
  for (const block of blocks) {
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
    // Variable fonts report a range ("400 600"); keep it so one face serves every weight.
    const weight = block.match(/font-weight:\s*([\d ]+);/)?.[1]?.trim() || "400";
    const style = block.match(/font-style:\s*(\w+)/)?.[1] || "normal";
    const unicodeRange = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
    const url = block.match(/url\((https:\/\/[^)]+)\)\s*format\(['"]woff2['"]\)/)?.[1];
    if (family && url) {
      faces.push({ family, weight, style, unicodeRange, url });
    }
  }
  return faces;
}

async function buildEmbeddedCss(familyQuery, text) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${familyQuery}` +
    `&text=${encodeURIComponent(text)}&display=swap`;
  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  if (!cssRes.ok) throw new Error(`Font CSS ${cssRes.status}: ${cssUrl}`);
  const css = await cssRes.text();
  const faces = parseFontFaces(css);
  if (!faces.length) {
    throw new Error(`No @font-face in CSS for ${familyQuery}\n${css.slice(0, 500)}`);
  }

  const parts = [];
  let totalBytes = 0;
  for (const face of faces) {
    const bin = Buffer.from(
      await (await fetch(face.url, { headers: { "User-Agent": UA } })).arrayBuffer(),
    );
    totalBytes += bin.length;
    const b64 = bin.toString("base64");
    const range = face.unicodeRange
      ? `\n  unicode-range: ${face.unicodeRange};`
      : "";
    parts.push(`@font-face {
  font-family: '${face.family}';
  font-style: ${face.style};
  font-weight: ${face.weight};
  font-display: swap;
  src: url(data:font/woff2;base64,${b64}) format('woff2');${range}
}`);
  }
  console.log(`  ${faces.length} face(s), ${(totalBytes / 1024).toFixed(1)} KB raw`);
  return parts.join("\n");
}

async function main() {
  const classicText = collectText();
  console.log(`Classic subset chars: ${classicText.length}`);
  const classicCss = await buildEmbeddedCss("Ma+Shan+Zheng", classicText);

  const latinText = collectCuteLatinText();
  console.log(`Cute Latin subset chars: ${latinText.length}`);
  const fredokaCss = await buildEmbeddedCss("Fredoka:wght@400..600", latinText);

  const hanziText = collectHanziText();
  console.log(`Cute hanzi subset chars: ${hanziText.length}`);
  const kuaileCss = await buildEmbeddedCss("ZCOOL+KuaiLe", hanziText);

  const body = `/**
 * Auto-generated by scripts/embed-fonts.js — do not edit by hand.
 * Subsetted fonts for SVG <img> embeds (GitHub README / Camo).
 * EMBEDDED_FONT_CSS: Ma Shan Zheng (classic theme).
 * CUTE_FONT_CSS: Fredoka 400/600 + ZCOOL KuaiLe (cute theme).
 */
export const EMBEDDED_FONT_CSS = ${JSON.stringify(classicCss)};
export const CUTE_FONT_CSS = ${JSON.stringify(`${fredokaCss}\n${kuaileCss}`)};
`;
  writeFileSync(OUT, body, "utf8");
  console.log(`Wrote ${OUT} (${(Buffer.byteLength(body) / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
