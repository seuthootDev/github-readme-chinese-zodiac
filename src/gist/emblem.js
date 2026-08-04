/**
 * Right-column pin emblem: simplified Chinese animal + earthly branch.
 * Avoids constellation/star ASCII — 简体字 reads clearer in Gist pins.
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

export function getAnimalHanzi(animalId) {
  return HANZI[animalId] || "生";
}

/** Fixed 5-line block for mergePinRows (GitHub pin preview). */
export function getPinEmblem(zodiac) {
  const hanzi = zodiac.hanzi || getAnimalHanzi(zodiac.id);
  const branch = zodiac.earthlyBranch || "支";
  return [
    "  +----+",
    `  | ${hanzi} |`,
    `  | ${branch} |`,
    "  +----+",
    "   生肖",
  ];
}
