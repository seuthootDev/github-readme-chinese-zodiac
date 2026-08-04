/**
 * Compact ASCII “star maps” for each animal (pin right column).
 * Grid `*` → ✦ (wide glyph); connectors stay ASCII.
 */

const GRIDS = {
  rat: ["  *--* ", " /    \\", "*      *", " \\  * /", "  *--* "],
  ox: [" *----* ", "/      \\", "*      *", "\\      /", " *----* "],
  tiger: ["   *   ", " *-*-* ", "*  |  *", " \\ | / ", "  -*-  "],
  rabbit: ["  *  * ", " / \\/ \\", "*      *", " \\    / ", "  *--*  "],
  dragon: ["  *--*  ", " /    \\ ", "*  *   *", " \\    / ", "  *--*  "],
  snake: ["*---*  ", "    \\  ", "     *-", "    /  ", "*---*  "],
  horse: ["    *  ", "   / \\ ", " *-*-* ", "/  |  \\", "*  *  *"],
  goat: ["  *--* ", " / *  \\", "*      *", " \\    / ", "  *--*  "],
  monkey: ["*  *  *", " \\|/  ", "  *-*  ", " /|\\  ", "*  *  *"],
  rooster: ["   *   ", "  /|\\  ", " *-*-* ", "  / \\  ", " *   * "],
  dog: [" *--*  ", "/    \\ ", "*  *  *", "\\    / ", " *--*  "],
  pig: [" *----* ", "/      \\", "*  *   *", "\\      /", " *----* "],
};

function renderGrid(rows) {
  return rows.map((row) => row.replaceAll("*", "✦"));
}

export const ASCII_CONSTELLATIONS = Object.fromEntries(
  Object.entries(GRIDS).map(([id, rows]) => [id, renderGrid(rows)]),
);

export function getAsciiConstellation(signId) {
  return ASCII_CONSTELLATIONS[signId] || ASCII_CONSTELLATIONS.dragon;
}
