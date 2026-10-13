export function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function wrapText(text, maxChars, maxLines = 3) {
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

export function secondaryDisplayName(profile) {
  const login = String(profile.username || "").trim();
  const name = String(profile.name || "").trim();
  if (!name || !login) return name && name !== login ? name : "";
  if (name.toLowerCase() === login.toLowerCase()) return "";
  return name;
}

/** Cut to maxChars including a trailing "…" when shortened. */
export function truncate(text, maxChars) {
  const s = String(text ?? "").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}
