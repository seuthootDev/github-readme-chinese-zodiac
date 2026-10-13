/**
 * Hand-coded chibi faces for the cute theme (120×120 box).
 * `silhouette` = outer shapes (get shadow + white border + ink outline from renderSticker);
 * `details` = raw SVG drawn on top (eyes, noses, stripes, blush).
 */
const INK = "#5a3d35";
const BLUSH = "#ff8fa3";

const el = (tag, attrs, fill) => ({ tag, attrs, fill });
const head = (fill, { cy = 68, rx = 42, ry = 38 } = {}) =>
  el("ellipse", { cx: 60, cy, rx, ry }, fill);

const eyes = (y = 62, dx = 16) =>
  [60 - dx, 60 + dx]
    .map(
      (x) =>
        `<circle cx="${x}" cy="${y}" r="4.5" fill="${INK}"/><circle cx="${x + 1.5}" cy="${y - 1.5}" r="1.4" fill="#ffffff"/>`,
    )
    .join("");

const blush = (y = 78, dx = 28) =>
  [60 - dx, 60 + dx]
    .map((x) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="${BLUSH}" opacity="0.55"/>`)
    .join("");

const line = (d, width = 2.5, color = INK) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const outlined = (tag, attrs, fill, width = 2.5) =>
  `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} fill="${fill}" stroke="${INK}" stroke-width="${width}"/>`;

export default {
  rat: {
    silhouette: [
      el("circle", { cx: 26, cy: 38, r: 18 }, "#d9d4e6"),
      el("circle", { cx: 94, cy: 38, r: 18 }, "#d9d4e6"),
      head("#e6e1f0", { cy: 70, rx: 40, ry: 36 }),
    ],
    details: [
      `<circle cx="26" cy="38" r="9" fill="#ffc8d3"/><circle cx="94" cy="38" r="9" fill="#ffc8d3"/>`,
      eyes(66),
      blush(80, 26),
      outlined("ellipse", { cx: 60, cy: 80, rx: 5, ry: 3.5 }, BLUSH, 2),
      outlined("rect", { x: 56, y: 85, width: 8, height: 6, rx: 1.5 }, "#ffffff", 1.8),
      line("M40 82 L24 79 M40 87 L25 89 M80 82 L96 79 M80 87 L95 89", 2),
    ],
  },

  ox: {
    silhouette: [
      el("path", { d: "M30 44 Q12 34 16 14 Q28 28 44 34 Z" }, "#fff3dc"),
      el("path", { d: "M90 44 Q108 34 104 14 Q92 28 76 34 Z" }, "#fff3dc"),
      el("ellipse", { cx: 18, cy: 60, rx: 11, ry: 6 }, "#e8cfa4"),
      el("ellipse", { cx: 102, cy: 60, rx: 11, ry: 6 }, "#e8cfa4"),
      head("#f3e2c4", { cy: 68, rx: 40, ry: 38 }),
    ],
    details: [
      line("M50 36 q5 -8 10 0 q5 -8 10 0"),
      eyes(60),
      blush(74, 30),
      outlined("ellipse", { cx: 60, cy: 86, rx: 22, ry: 13 }, "#ffd9c2"),
      `<ellipse cx="52" cy="86" rx="2.4" ry="3.2" fill="${INK}"/><ellipse cx="68" cy="86" rx="2.4" ry="3.2" fill="${INK}"/>`,
    ],
  },

  tiger: {
    silhouette: [
      el("circle", { cx: 28, cy: 36, r: 13 }, "#ffb36b"),
      el("circle", { cx: 92, cy: 36, r: 13 }, "#ffb36b"),
      head("#ffc68c"),
    ],
    details: [
      `<circle cx="28" cy="36" r="6" fill="#ffe2c4"/><circle cx="92" cy="36" r="6" fill="#ffe2c4"/>`,
      line("M50 40h20M52 47h16M60 38v12", 3.5),
      line("M21 62l9 2M21 72l9 0M99 62l-9 2M99 72l-9 0", 3),
      blush(78, 26),
      outlined("ellipse", { cx: 52, cy: 82, rx: 10, ry: 8 }, "#fff4e8"),
      outlined("ellipse", { cx: 68, cy: 82, rx: 10, ry: 8 }, "#fff4e8"),
      `<path d="M55 74h10l-5 5z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
      eyes(64),
    ],
  },

  rabbit: {
    silhouette: [
      el("ellipse", { cx: 42, cy: 30, rx: 10, ry: 24, transform: "rotate(-12 42 30)" }, "#fffafc"),
      el("ellipse", { cx: 78, cy: 30, rx: 10, ry: 24, transform: "rotate(12 78 30)" }, "#fffafc"),
      head("#fffafc", { cy: 74, rx: 40, ry: 34 }),
    ],
    details: [
      `<ellipse cx="42" cy="27" rx="4.5" ry="15" transform="rotate(-12 42 30)" fill="#ffc8d3"/>`,
      `<ellipse cx="78" cy="27" rx="4.5" ry="15" transform="rotate(12 78 30)" fill="#ffc8d3"/>`,
      eyes(70),
      blush(84, 26),
      `<path d="M56 80h8l-4 4z" fill="${BLUSH}" stroke="${BLUSH}" stroke-width="2" stroke-linejoin="round"/>`,
      line("M60 84 q-4 5 -8 2 M60 84 q4 5 8 2", 2),
    ],
  },

  dragon: {
    silhouette: [
      el("path", { d: "M16 60 L4 48 L20 78 Z" }, "#7fd6b5"),
      el("path", { d: "M104 60 L116 48 L100 78 Z" }, "#7fd6b5"),
      el("path", { d: "M38 40 L30 12 L52 32 Z" }, "#ffe08a"),
      el("path", { d: "M82 40 L90 12 L68 32 Z" }, "#ffe08a"),
      head("#a8e6cf"),
    ],
    details: [
      `<circle cx="52" cy="40" r="3.5" fill="#7fd6b5"/><circle cx="60" cy="36" r="3.5" fill="#7fd6b5"/><circle cx="68" cy="40" r="3.5" fill="#7fd6b5"/>`,
      eyes(62),
      blush(78, 30),
      outlined("ellipse", { cx: 60, cy: 86, rx: 20, ry: 12 }, "#e4f8ec"),
      `<circle cx="53" cy="84" r="2.2" fill="${INK}"/><circle cx="67" cy="84" r="2.2" fill="${INK}"/>`,
      line("M40 88 q-12 2 -16 -6 M80 88 q12 2 16 -6", 2),
    ],
  },

  snake: {
    silhouette: [
      el("ellipse", { cx: 60, cy: 102, rx: 46, ry: 12 }, "#a6d97c"),
      head("#bfe59a", { cy: 68, rx: 44, ry: 34 }),
    ],
    details: [
      `<path d="M60 40 l6 6 -6 6 -6 -6z" fill="#8cc65a"/>`,
      `<circle cx="46" cy="44" r="3" fill="#8cc65a"/><circle cx="74" cy="44" r="3" fill="#8cc65a"/>`,
      eyes(64, 18),
      blush(78, 30),
      line("M52 82 q8 6 16 0"),
      line("M60 86 v8 M60 94 l-3 4 M60 94 l3 4", 2.5, "#ff6f8f"),
    ],
  },

  horse: {
    silhouette: [
      el("path", { d: "M34 40 L36 12 L54 32 Z" }, "#f5c6a5"),
      el("path", { d: "M86 40 L84 12 L66 32 Z" }, "#f5c6a5"),
      head("#f5c6a5", { cy: 70, rx: 38, ry: 38 }),
      el("path", { d: "M42 38 Q48 16 62 26 Q72 14 80 36 Q62 30 42 38 Z" }, "#c98a68"),
    ],
    details: [
      eyes(64),
      blush(80, 28),
      outlined("ellipse", { cx: 60, cy: 90, rx: 24, ry: 14 }, "#ffe2cf"),
      `<ellipse cx="52" cy="90" rx="2.4" ry="3.2" fill="${INK}"/><ellipse cx="68" cy="90" rx="2.4" ry="3.2" fill="${INK}"/>`,
    ],
  },

  goat: {
    silhouette: [
      el("path", { d: "M50 98 Q60 128 70 98 Z" }, "#fbf6ea"),
      el("path", { d: "M40 38 C24 32 20 14 34 12 C44 12 46 24 48 32 Z" }, "#d9c49a"),
      el("path", { d: "M80 38 C96 32 100 14 86 12 C76 12 74 24 72 32 Z" }, "#d9c49a"),
      el("ellipse", { cx: 18, cy: 64, rx: 13, ry: 6, transform: "rotate(20 18 64)" }, "#fbf6ea"),
      el("ellipse", { cx: 102, cy: 64, rx: 13, ry: 6, transform: "rotate(-20 102 64)" }, "#fbf6ea"),
      head("#fbf6ea", { cy: 68, rx: 38, ry: 38 }),
    ],
    details: [
      line("M50 34 q5 -8 10 -2 q5 -8 10 2"),
      eyes(64, 15),
      blush(80, 26),
      `<path d="M56 82h8l-4 4z" fill="#c99a5e" stroke="#c99a5e" stroke-width="2" stroke-linejoin="round"/>`,
      line("M54 90 q6 5 12 0", 2.2),
    ],
  },

  monkey: {
    silhouette: [
      el("circle", { cx: 16, cy: 66, r: 12 }, "#c98f62"),
      el("circle", { cx: 104, cy: 66, r: 12 }, "#c98f62"),
      head("#c98f62", { cy: 66, rx: 40, ry: 38 }),
    ],
    details: [
      `<circle cx="14" cy="66" r="6" fill="#ffe0c2"/><circle cx="106" cy="66" r="6" fill="#ffe0c2"/>`,
      `<g fill="#ffe0c2"><ellipse cx="48" cy="62" rx="14" ry="13"/><ellipse cx="72" cy="62" rx="14" ry="13"/><ellipse cx="60" cy="82" rx="24" ry="16"/></g>`,
      line("M54 32 q6 -10 12 0"),
      eyes(62, 12),
      `<circle cx="57" cy="78" r="1.6" fill="${INK}"/><circle cx="63" cy="78" r="1.6" fill="${INK}"/>`,
      line("M50 86 q10 8 20 0"),
      blush(84, 22),
    ],
  },

  rooster: {
    silhouette: [
      el("path", { d: "M46 36 Q42 16 54 20 Q58 6 66 20 Q78 16 74 36 Z" }, "#ff6f6f"),
      head("#fffaf3", { cy: 70, rx: 40, ry: 38 }),
    ],
    details: [
      eyes(64),
      blush(80, 28),
      `<path d="M52 76 L68 76 L60 88 Z" fill="#ffcc4d" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,
      outlined("ellipse", { cx: 60, cy: 95, rx: 5, ry: 7 }, "#ff6f6f", 2),
    ],
  },

  dog: {
    silhouette: [
      head("#f6d7a7", { cy: 66, rx: 40, ry: 38 }),
      el("ellipse", { cx: 22, cy: 58, rx: 13, ry: 24, transform: "rotate(18 22 58)" }, "#c98a5a"),
      el("ellipse", { cx: 98, cy: 58, rx: 13, ry: 24, transform: "rotate(-18 98 58)" }, "#c98a5a"),
    ],
    details: [
      eyes(62, 15),
      blush(80, 26),
      outlined("ellipse", { cx: 60, cy: 82, rx: 18, ry: 12 }, "#fff4e6"),
      `<ellipse cx="60" cy="77" rx="6" ry="4.5" fill="${INK}"/>`,
      line("M60 81 v5 M60 86 q-5 4 -9 1 M60 86 q5 4 9 1", 2),
    ],
  },

  pig: {
    silhouette: [
      el("path", { d: "M30 40 L36 14 L56 32 Z" }, "#f7a8b8"),
      el("path", { d: "M90 40 L84 14 L64 32 Z" }, "#f7a8b8"),
      head("#ffc8d3"),
      el("ellipse", { cx: 60, cy: 80, rx: 14, ry: 10 }, "#f7a8b8"),
    ],
    details: [
      eyes(62),
      `<ellipse cx="55" cy="80" rx="2.2" ry="3" fill="${INK}"/><ellipse cx="65" cy="80" rx="2.2" ry="3" fill="${INK}"/>`,
      blush(78, 28),
    ],
  },
};
