export const STICKER_INK = "#5a3d35";

function toAttrs(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}

function shape({ tag, attrs }, extra = "") {
  return `<${tag} ${toAttrs(attrs)}${extra}/>`;
}

/**
 * Sticker-outline character in a 120×120 box.
 * Layers come from `silhouette` automatically so all 12 animals match:
 * drop shadow → white sticker border → colored shapes with ink outline → `details` on top.
 * @param {{ silhouette: { tag: string, attrs: object, fill: string }[], details: string[] }} def
 */
export function renderSticker(def) {
  const bare = def.silhouette.map((s) => shape(s)).join("");
  const body = def.silhouette.map((s) => shape(s, ` fill="${s.fill}"`)).join("");
  return `<g class="sticker" stroke-linejoin="round">
      <g class="sticker-shadow" transform="translate(2 3)" fill="#000000" stroke="#000000" stroke-width="14" opacity="0.12">${bare}</g>
      <g class="sticker-border" fill="#ffffff" stroke="#ffffff" stroke-width="14">${bare}</g>
      <g class="sticker-body" stroke="${STICKER_INK}" stroke-width="3">${body}</g>
      <g class="sticker-details">${def.details.join("")}</g>
    </g>`;
}
