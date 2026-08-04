/**
 * Right-column pin emblem: 地支 + 简体生肖 in per-animal frames.
 * Borders are ASCII-only so GitHub Gist monospace width stays stable next to CJK.
 */

const HANZI = {
  rat: "鼠",
  ox: "牛",
  tiger: "虎",
  rabbit: "兔",
  dragon: "龙",
  snake: "蛇",
  horse: "马",
  goat: "羊",
  monkey: "猴",
  rooster: "鸡",
  dog: "狗",
  pig: "猪",
};

/**
 * 4-line ASCII frames (all border cells width 1).
 * `{b}` = earthly branch, `{h}` = animal hanzi.
 */
const FRAMES = {
  rat: ["+----+", "| {b} |", "| {h} |", "+----+"],
  ox: ["#====#", "# {b} #", "# {h} #", "#====#"],
  tiger: ["/----\\", "| {b} |", "| {h} |", "\\----/"],
  rabbit: [".----.", "| {b} |", "| {h} |", "'----'"],
  dragon: ["*----*", "| {b} |", "| {h} |", "*----*"],
  snake: ["/~~~~\\", "| {b} |", "| {h} |", "\\____/"],
  horse: ["=----=", "| {b} |", "| {h} |", "=----="],
  goat: ["(----)", "| {b} |", "| {h} |", "(----)"],
  monkey: ["^----^", "| {b} |", "| {h} |", "v----v"],
  rooster: [":----:", "| {b} |", "| {h} |", ":----:"],
  dog: ["[----]", "| {b} |", "| {h} |", "[----]"],
  pig: ["{----}", "| {b} |", "| {h} |", "{----}"],
};

const DEFAULT_FRAME = FRAMES.rat;

export function getAnimalHanzi(animalId) {
  return HANZI[animalId] || "生";
}

/** Fixed 5-line block for mergePinRows (GitHub pin preview). */
export function getPinEmblem(zodiac) {
  const hanzi = zodiac.hanzi || getAnimalHanzi(zodiac.id);
  const branch = zodiac.earthlyBranch || "支";
  const template = FRAMES[zodiac.id] || DEFAULT_FRAME;
  const box = template.map((line) =>
    line.replace("{b}", branch).replace("{h}", hanzi),
  );
  // center 生肖 under 6-col box (2 + CJK + CJK)
  return [...box, "  生肖"];
}
