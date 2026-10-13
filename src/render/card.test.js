import { describe, it } from "node:test";
import assert from "node:assert/strict";
import signs from "../data/animals.js";
import { renderZodiacCard, resolveTheme } from "./card.js";
import { EMBEDDED_FONT_CSS, CUTE_FONT_CSS } from "../data/embedded-fonts.js";
import { assertBalancedTags } from "./assert-svg.js";

describe("renderZodiacCard stats", () => {
  it("sizes bars relative to the highest of the three shown stats", () => {
    const rat = signs[0];
    const svg = renderZodiacCard({
      profile: {
        username: "alice",
        name: "Alice",
        role: "Dev",
        languages: [{ name: "JS" }],
      },
      zodiac: rat,
      stats: {
        builder: 200,
        explorer: 100,
        debugger: 50,
        consistency: 1,
        openSource: 1,
      },
      meta: { theme: "classic" },
    });

    const fills = [
      ...svg.matchAll(/width="(\d+)" height="7" fill="#[^"]+"\/>/g),
    ].map((m) => Number(m[1]));

    assert.deepEqual(fills, [75, 38, 150]);
    assert.match(svg, />100</);
    assert.match(svg, />50</);
    assert.match(svg, />200</);
  });
});

describe("renderZodiacCard hanzi seal", () => {
  it("centers the circular seal on the large hanzi, not between large and branch glyphs", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: { username: "alice", name: "Alice", role: "Dev" },
      zodiac: pig,
      stats: {
        builder: 1,
        explorer: 1,
        debugger: 1,
        consistency: 1,
        openSource: 1,
      },
      meta: { theme: "classic" },
    });

    const large = svg.match(
      /<text\s+x="168"\s+y="(\d+)"[\s\S]*?font-size="(\d+)"[\s\S]*?>猪</,
    );
    const circles = [...svg.matchAll(/<circle cx="168" cy="(\d+)" r="(?:72|64)"/g)].map(
      (m) => Number(m[1]),
    );

    assert.ok(large, "large hanzi text not found");
    assert.equal(circles.length, 2);
    const largeY = Number(large[1]);
    const largeSize = Number(large[2]);
    const expectedCy = largeY - Math.round(largeSize * 0.38);
    assert.deepEqual(circles, [expectedCy, expectedCy]);
  });
});

describe("resolveTheme", () => {
  it("returns classic only for the classic keyword (case/space-insensitive)", () => {
    assert.equal(resolveTheme("classic"), "classic");
    assert.equal(resolveTheme(" Classic "), "classic");
  });

  it("falls back to cute for cute, empty, missing, or unknown values", () => {
    assert.equal(resolveTheme("cute"), "cute");
    assert.equal(resolveTheme(""), "cute");
    assert.equal(resolveTheme(undefined), "cute");
    assert.equal(resolveTheme(null), "cute");
    assert.equal(resolveTheme("neon"), "cute");
  });
});

describe("embedded fonts", () => {
  it("ships Fredoka and ZCOOL KuaiLe for cute and keeps Ma Shan Zheng for classic", () => {
    assert.match(CUTE_FONT_CSS, /font-family: 'Fredoka'/);
    assert.match(CUTE_FONT_CSS, /font-weight: 400 600;/);
    assert.match(CUTE_FONT_CSS, /font-family: 'ZCOOL KuaiLe'/);
    assert.doesNotMatch(CUTE_FONT_CSS, /Ma Shan Zheng/);
    assert.match(EMBEDDED_FONT_CSS, /font-family: 'Ma Shan Zheng'/);
  });
});

const ONES = { builder: 1, explorer: 1, debugger: 1, consistency: 1, openSource: 1 };
const alice = { username: "alice", name: "Alice", role: "Dev", languages: [{ name: "JS" }] };

describe("cute theme (default)", () => {
  it("is used when no theme is given", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES });
    assert.match(svg, /font-family: 'Fredoka'/);
    assert.ok(svg.includes(pig.cuteColors.bg));
    assert.doesNotMatch(svg, /Ma Shan Zheng/);
  });

  it("renders every animal with hanzi, pinyin, year label and its sticker", () => {
    for (const zodiac of signs) {
      const svg = renderZodiacCard({ profile: alice, zodiac, stats: ONES });
      assert.ok(svg.includes(`>${zodiac.hanzi}<`), `${zodiac.id} hanzi`);
      // ī is drawn as dotless ı + combining macron (Fredoka glyph workaround).
      assert.ok(svg.includes(zodiac.pinyin.replace(/ī/g, "ı̄")), `${zodiac.id} pinyin`);
      assert.ok(svg.includes(`YEAR OF THE ${zodiac.sign.toUpperCase()}`), `${zodiac.id} year`);
      assert.ok(svg.includes('class="character"'), `${zodiac.id} character`);
      assert.ok(svg.includes('class="sticker"'), `${zodiac.id} sticker`);
      assertBalancedTags(svg.replace(/^<\?xml[^>]*>/, ""));
    }
  });

  it("sizes bars relative to the highest of the three shown stats", () => {
    const rat = signs[0]; // statKeys: explorer, debugger, builder
    const svg = renderZodiacCard({
      profile: alice,
      zodiac: rat,
      stats: { builder: 200, explorer: 100, debugger: 50, consistency: 1, openSource: 1 },
    });
    const fills = [...svg.matchAll(/class="bar-fill" x="\d+" y="\d+" width="(\d+)"/g)].map((m) =>
      Number(m[1]),
    );
    assert.deepEqual(fills, [90, 45, 180]);
  });

  it("escapes user-supplied text", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: { username: "alice", name: "<script>x</script>", role: "R&D" },
      zodiac: pig,
      stats: ONES,
    });
    assert.doesNotMatch(svg, /<script>/);
    assert.ok(svg.includes("&lt;script&gt;"));
    assert.ok(svg.includes("R&amp;D"));
  });

  it("twinkles sparkles only with glow", () => {
    const pig = signs.find((s) => s.id === "pig");
    const plain = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES });
    const glow = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES, meta: { glow: true } });
    assert.doesNotMatch(plain, /<animate/);
    assert.match(glow, /<animate attributeName="opacity"/);
  });

  it("labels the footer with element and mapping source", () => {
    const pig = signs.find((s) => s.id === "pig");
    const byBirth = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES, meta: { source: "birthdate" } });
    const bySeed = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES, meta: { source: "username" } });
    assert.ok(byBirth.includes("Water · by birth year"));
    assert.ok(bySeed.includes("Water · by name-seed"));
  });

  // Review Focus
  it("keeps a long login out of the hanzi area (truncates, drops role first)", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: { username: "a".repeat(39), name: "Alice", role: "Software Developer" },
      zodiac: pig,
      stats: ONES,
    });
    // aria-label / <title> keep the full login; only the visible name line is checked.
    const nameLine = svg.match(/<text x="30" y="152"[^>]*>([\s\S]*?)<\/text>/)?.[1] ?? "";
    assert.ok(nameLine.startsWith(`${"a".repeat(21)}…`), nameLine);
    assert.ok(!nameLine.includes("Software Developer"));
    assert.ok(nameLine.includes(">Alice<"));
  });

  it("omits the language line when no languages are known", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: { username: "alice", languages: [] },
      zodiac: pig,
      stats: ONES,
    });
    assert.doesNotMatch(svg, /class="languages"/);
  });

  it("renders all-zero stats without NaN or empty fills", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: alice,
      zodiac: pig,
      stats: { builder: 0, explorer: 0, debugger: 0, consistency: 0, openSource: 0 },
    });
    assert.doesNotMatch(svg, /NaN/);
    assert.doesNotMatch(svg, /class="bar-fill"/);
  });

  it("honors width like the classic card", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES, meta: { width: 600 } });
    assert.match(svg, /<svg width="600" height="320" viewBox="0 0 600 320"/);
  });
});

describe("cute theme — final review fixes", () => {
  const pig = signs.find((s) => s.id === "pig");
  const nameLineOf = (svg) => svg.match(/<text x="30" y="152"[^>]*>([\s\S]*?)<\/text>/)?.[1] ?? "";
  const languagesOf = (svg) =>
    svg.match(/<g class="languages">[\s\S]*?<text[^>]*>([\s\S]*?)<\/text>/)?.[1] ?? "";

  it("drops trailing languages that would run into the hanzi", () => {
    const svg = renderZodiacCard({
      profile: {
        username: "alice",
        languages: [{ name: "Jupyter Notebook" }, { name: "TypeScript" }, { name: "JavaScript" }],
      },
      zodiac: pig,
      stats: ONES,
    });
    assert.equal(languagesOf(svg), "Jupyter Notebook · TypeScript");
  });

  it("truncates a single language name that is too long on its own", () => {
    const svg = renderZodiacCard({
      profile: { username: "alice", languages: [{ name: "Protocol Buffer Text Format Extended Edition" }] },
      zodiac: pig,
      stats: ONES,
    });
    const label = languagesOf(svg);
    assert.ok(label.endsWith("…"), label);
    assert.ok(label.length < "Protocol Buffer Text Format Extended Edition".length);
  });

  it("measures CJK real names as full-width (drops role instead of overflowing)", () => {
    const svg = renderZodiacCard({
      profile: { username: "abcdefghijkl", name: "가나다라마바사아자차카타", role: "Developer" },
      zodiac: pig,
      stats: ONES,
    });
    const line = nameLineOf(svg);
    assert.ok(line.includes("가나다라마바사아자차카타"), line);
    assert.ok(!line.includes("Developer"), line);
  });

  it("draws the earthly branch in the YEAR line with the embedded hanzi font", () => {
    const svg = renderZodiacCard({ profile: alice, zodiac: pig, stats: ONES });
    assert.match(svg, /YEAR OF THE PIG · <tspan font-family="ZCOOL KuaiLe[^"]*">亥<\/tspan>/);
  });
});

describe("cute theme — visual check fixes", () => {
  it("draws ī as dotless i + combining macron (Fredoka's precomposed ī misplaces the macron)", () => {
    const rooster = signs.find((s) => s.id === "rooster");
    const svg = renderZodiacCard({ profile: alice, zodiac: rooster, stats: ONES });
    assert.ok(svg.includes("j\u0131\u0304 ·"));
    assert.ok(!svg.includes("j\u012b"));
  });

  it("measures wide capitals so an all-W/M login is truncated before the hanzi", () => {
    const pig = signs.find((s) => s.id === "pig");
    const svg = renderZodiacCard({
      profile: { username: "WWWWMMMMWWWWMMMMWWWWMM" },
      zodiac: pig,
      stats: ONES,
    });
    const line = svg.match(/<text x="30" y="152"[^>]*>([\s\S]*?)(?:<tspan|<\/text>)/)?.[1] ?? "";
    assert.ok(line.endsWith("…"), line);
    assert.ok(line.length <= 18, line);
  });

  it("subsets the dotless i and combining macron into the cute font", () => {
    assert.match(CUTE_FONT_CSS, /U\+131\b|U\+130-131/);
  });
});
