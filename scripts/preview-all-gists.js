import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGitHubProfile } from "../src/lib/github.js";
import { getAllSigns } from "../src/lib/zodiac.js";
import { calculateStats } from "../src/lib/stats.js";
import { renderGistCard, gistFilename } from "../src/gist/render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Don't use USERNAME — on Windows it is the OS login name, not GitHub.
const username =
  process.env.ZODIAC_USERNAME || process.env.GH_USER || "seuthootDev";

const profile = await fetchGitHubProfile(username);
const stats = calculateStats(profile);
const signs = getAllSigns();

const cards = signs.map((zodiac) => {
  const full = renderGistCard({ profile, zodiac, stats });
  const pin = full.split("\n").slice(0, 5).join("\n");
  return { zodiac, full, pin, filename: gistFilename(zodiac) };
});

const outDir = path.join(__dirname, "out");
mkdirSync(outDir, { recursive: true });

const txt = [
  `github-readme-chinese-zodiac gist preview`,
  `user: ${profile.username} (${profile.name})`,
  `generated: ${new Date().toISOString()}`,
  "",
  ...cards.flatMap(({ filename, zodiac, pin, full }) => [
    `===== ${filename} (${zodiac.id}) =====`,
    "",
    "--- pin (first 5 lines) ---",
    pin,
    "",
    "--- full gist ---",
    full,
    "",
  ]),
].join("\n");

writeFileSync(path.join(outDir, "all-signs-gist-preview.txt"), txt, "utf8");

const escape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Gist pin preview — 12 signs</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      padding: 24px;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #0d1117;
      color: #e6edf3;
    }
    h1 { font-size: 1.25rem; margin: 0 0 8px; }
    .meta { color: #8b949e; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 16px;
    }
    section {
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px 16px;
      background: #161b22;
    }
    h2 { font-size: 0.95rem; margin: 0 0 10px; font-weight: 600; }
    pre {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.35;
      white-space: pre;
      overflow-x: auto;
    }
    .label {
      color: #8b949e;
      font-size: 11px;
      margin: 12px 0 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <h1>Gist pin preview — all 12 signs</h1>
  <p class="meta">@${escape(profile.username)} · open this file in a browser · monospace like GitHub</p>
  <div class="grid">
    ${cards
      .map(
        ({ filename, pin, full }) => `
    <section>
      <h2>${escape(filename)}</h2>
      <div class="label">Pin (5 lines)</div>
      <pre>${escape(pin)}</pre>
      <div class="label">Full gist</div>
      <pre>${escape(full)}</pre>
    </section>`,
      )
      .join("")}
  </div>
</body>
</html>
`;

const htmlPath = path.join(outDir, "all-signs-gist-preview.html");
writeFileSync(htmlPath, html, "utf8");
console.log(`Preview ready for @${profile.username}`);
console.log(`HTML: ${htmlPath}`);
console.log(`TXT:  ${path.join(outDir, "all-signs-gist-preview.txt")}`);
