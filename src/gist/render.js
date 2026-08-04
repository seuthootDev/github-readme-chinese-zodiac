import { pickDisplayStats } from "../lib/stats.js";
import { getPinEmblem } from "./emblem.js";

const LEFT_WIDTH = 36;
const BAR_WIDTH = 12;

function codeWidth(code) {
  if (!code) return 0;
  // combining marks / variation selectors
  if (code >= 0xfe00 && code <= 0xfe0f) return 0;
  if (code >= 0x0300 && code <= 0x036f) return 0;
  // emoji & pictographs (⭐ 📦 👥 etc.)
  if (code >= 0x1f300 && code <= 0x1faff) return 2;
  if (code >= 0x1f000 && code <= 0x1f02f) return 2;
  // misc symbols / dingbats often render wide in gist
  if (code >= 0x2600 && code <= 0x27bf) return 2;
  // zodiac ♈–♓ — treat wide so padding stays stable on GitHub
  if (code >= 0x2648 && code <= 0x2653) return 2;
  // CJK / Hangul
  if (code >= 0x1100 && code <= 0x115f) return 2;
  if (code >= 0x2e80 && code <= 0xa4cf) return 2;
  if (code >= 0xac00 && code <= 0xd7a3) return 2;
  if (code >= 0xf900 && code <= 0xfaff) return 2;
  if (code >= 0xff00 && code <= 0xff60) return 2;
  return 1;
}

function displayWidth(str) {
  let w = 0;
  for (const ch of String(str ?? "")) {
    w += codeWidth(ch.codePointAt(0));
  }
  return w;
}

function clipPad(str, width) {
  let out = "";
  let w = 0;
  for (const ch of String(str ?? "")) {
    const cw = codeWidth(ch.codePointAt(0));
    if (w + cw > width) break;
    out += ch;
    w += cw;
  }
  return out + " ".repeat(Math.max(0, width - w));
}

function num(n, width = 4) {
  return String(n ?? 0).padStart(width, " ");
}

/** 0–999 as-is; 1000+ as k (e.g. 1200 → 1.2k, 10000 → 10k). Fixed width for pin alignment. */
function compactStat(n, width = 4) {
  const v = Math.max(0, Number(n) || 0);
  let text;
  if (v < 1000) {
    text = String(v);
  } else if (v < 10000) {
    const tenths = Math.round(v / 100) / 10; // one decimal
    text = `${tenths % 1 === 0 ? tenths.toFixed(0) : tenths.toFixed(1)}k`;
  } else if (v < 1000000) {
    text = `${Math.round(v / 1000)}k`;
  } else {
    const millions = Math.round(v / 100000) / 10;
    text = `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return text.padStart(width, " ");
}

function bar(value, width = BAR_WIDTH) {
  const filled = Math.max(0, Math.min(width, Math.round((value / 100) * width)));
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

function mergePinRows(leftLines, rightLines) {
  const rows = Math.max(leftLines.length, rightLines.length, 5);
  const out = [];
  for (let i = 0; i < rows; i++) {
    const left = clipPad(leftLines[i] || "", LEFT_WIDTH);
    const right = rightLines[i] || "";
    out.push(right ? `${left}  ${right}` : left.trimEnd());
  }
  return out;
}

const ROLE_ABBR = {
  "full-stack developer": "Full-Stack Dev",
  "fullstack developer": "Full-Stack Dev",
  "backend developer": "Backend Dev",
  "frontend developer": "Frontend Dev",
  "systems developer": "Systems Dev",
  "mobile developer": "Mobile Dev",
  "software engineer": "Software Eng",
  "software developer": "Software Dev",
  "web developer": "Web Dev",
  "app developer": "App Dev",
  "devops engineer": "DevOps",
};

/** Prefer real abbreviations over mid-word clipping ("Full-Stack Develo"). */
function abbreviateRole(role) {
  const raw = String(role || "Software Dev").trim();
  const mapped = ROLE_ABBR[raw.toLowerCase()];
  if (mapped) return mapped;
  return raw
    .replace(/\bFull[-\s]?Stack\b/gi, "Full-Stack")
    .replace(/\bDeveloper\b/gi, "Dev")
    .replace(/\bEngineer\b/gi, "Eng");
}

function abbreviateTitle(title) {
  // Drop leading "The " so pin titles fit: "The Builder" → "Builder"
  return String(title || "").replace(/^The\s+/i, "");
}

/**
 * Pin-first card: stats on the left, 简体 animal seal on the right.
 */
export function renderGistCard({ profile, zodiac, stats }) {
  const displayStats = pickDisplayStats(stats, zodiac, 3);
  const displayName = profile.name || profile.username;
  const role = abbreviateRole(profile.role || "Software Dev");
  const title = abbreviateTitle(zodiac.title);
  const langs = (profile.languages || [])
    .slice(0, 3)
    .map((l) => l.name)
    .join(" · ");

  const emblem = getPinEmblem(zodiac);

  const pinLeft = [
    `${zodiac.symbol} ${zodiac.sign.toUpperCase()} · ${title}`,
    `✨ ${displayName} · ${role}`,
    `🌟${compactStat(profile.stars)}  📦${compactStat(profile.publicRepos)}  👥${compactStat(profile.followers)}`,
    `${displayStats[0].label.slice(0, 10).padEnd(10)} ${bar(displayStats[0].value)} ${num(displayStats[0].value, 3)}%`,
    `${displayStats[1].label.slice(0, 10).padEnd(10)} ${bar(displayStats[1].value)} ${num(displayStats[1].value, 3)}%`,
  ];

  const lines = [...mergePinRows(pinLeft, emblem)];

  lines.push("────────────────────────────────────");
  lines.push(
    `${zodiac.symbol} ${zodiac.hanzi || ""} · ${zodiac.element} · ${zodiac.earthlyBranch || "支"}`,
  );
  if (langs) lines.push(langs);
  if (displayStats[2]) {
    lines.push(
      `${displayStats[2].label.slice(0, 10).padEnd(10)} ${bar(displayStats[2].value)} ${num(displayStats[2].value, 3)}%`,
    );
  }
  if (zodiac.description) {
    lines.push("");
    lines.push(`💫 ${zodiac.description}`);
  }
  lines.push("");
  lines.push("印 Your coding personality written in the Asian zodiac");

  return lines.join("\n");
}

export function gistFilename(zodiac) {
  return `${zodiac.symbol} ${zodiac.sign}.md`;
}

// exported for light testing
export { displayWidth, clipPad };
