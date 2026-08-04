/**
 * Right-column pin emblem: 地支 + 简体生肖 in per-animal frames.
 * Branch on top, animal below — borders vary, content stays the same grammar.
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

/** 4-line frames (corners ASCII/box-drawing only — avoid wide CJK brackets). */
const FRAMES = {
  rat: ["┌────┐", "│ {b} │", "│ {h} │", "└────┘"],
  ox: ["┏━━━━┓", "┃ {b} ┃", "┃ {h} ┃", "┗━━━━┛"],
  tiger: ["╲────╱", "│ {b} │", "│ {h} │", "╱────╲"],
  rabbit: ["╭····╮", "│ {b} │", "│ {h} │", "╰····╯"],
  dragon: ["*────*", "│ {b} │", "│ {h} │", "*────*"],
  snake: ["╱‾‾‾‾╲", "│ {b} │", "│ {h} │", "╲____╱"],
  horse: ["╒════╕", "│ {b} │", "│ {h} │", "╘════╛"],
  goat: ["(────)", "│ {b} │", "│ {h} │", "(────)"],
  monkey: ["⌜────⌝", "│ {b} │", "│ {h} │", "⌞────⌟"],
  rooster: ["┊····┊", "│ {b} │", "│ {h} │", "┊····┊"],
  dog: ["▣────▣", "│ {b} │", "│ {h} │", "▣────▣"],
  pig: ["╭────╮", "│ {b} │", "│ {h} │", "╰────╯"],
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
  return [...box, "  生肖"];
}
