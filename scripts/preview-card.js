import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGitHubProfile } from "../src/lib/github.js";
import { getAllSigns, resolveZodiac } from "../src/lib/zodiac.js";
import { calculateStats } from "../src/lib/stats.js";
import { renderZodiacCard } from "../src/render/card.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const username =
  process.env.ZODIAC_USERNAME || process.env.GH_USER || "torvalds";
const width = Number(process.env.WIDTH) || 420;
const glowMode =
  process.env.GLOW === "0" ? "off" : process.env.GLOW === "1" ? "on" : "alternate";

function cardGlow(index) {
  if (glowMode === "off") return false;
  if (glowMode === "on") return true;
  return index % 2 === 0;
}

process.env.DEMO_PROFILE = process.env.DEMO_PROFILE || "1";

const profile = await fetchGitHubProfile(username);
if (!profile.name || profile.name === profile.username) {
  if (username.toLowerCase() === "torvalds") profile.name = "Linus Torvalds";
  else if (username === "seuthootDev") profile.name = "JUNG SEUNGHOON";
}

const stats = calculateStats(profile);
const signs = getAllSigns();
const stamp = Date.now();

const cards = signs.map((zodiac, index) => {
  const { source } = resolveZodiac({
    username: profile.username,
    sign: zodiac.id,
  });
  const glow = cardGlow(index);
  const svg = renderZodiacCard({
    profile,
    zodiac,
    stats,
    meta: { source, width, glow },
  });
  return { zodiac, glow, svg: svg.replace(/^<\?xml[^>]*>\s*/, "") };
});

const outDir = path.join(root, "docs");
mkdirSync(outDir, { recursive: true });

const svgPath = path.join(outDir, "card-demo.svg");
const htmlPath = path.join(outDir, "card-demo.html");

writeFileSync(
  svgPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n${cards[0].svg}`,
  "utf8",
);

const sections = cards
  .map(
    ({ zodiac, glow, svg }) => `
  <section>
    <h2>${zodiac.symbol} ${zodiac.sign} · ${zodiac.hanzi || ""} ${zodiac.earthlyBranch || ""} · ${glow ? "glow" : "plain"}</h2>
    <div class="card">${svg}</div>
  </section>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Chinese zodiac — all 12 cards</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      padding: 28px 20px 48px;
      background: #0d1117;
      color: #e6edf3;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    h1 { font-size: 1.25rem; margin: 0 0 6px; text-align: center; }
    .meta { color: #8b949e; font-size: 13px; text-align: center; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 18px;
      max-width: 1400px;
      margin: 0 auto;
    }
    section {
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px 16px;
      background: #161b22;
    }
    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 10px;
      color: #c9d1d9;
    }
    .card { line-height: 0; }
    .card svg { width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
  <h1>Chinese zodiac — all 12 animals</h1>
  <div class="meta">
    ${profile.username}${profile.name && profile.name !== profile.username ? ` · ${profile.name}` : ""}
    · glow=${glowMode} · width=${width} · ${stamp}
  </div>
  <div class="grid">
${sections}
  </div>
  <div class="meta" style="margin-top:24px">Regenerate: <code>npm run preview:card</code></div>
</body>
</html>
`;

writeFileSync(htmlPath, html, "utf8");

console.log(`Wrote ${path.relative(root, htmlPath)} (${cards.length} cards)`);
console.log(`Open: ${htmlPath}`);
