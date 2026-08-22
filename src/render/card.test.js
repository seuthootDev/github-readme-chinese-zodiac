import { describe, it } from "node:test";
import assert from "node:assert/strict";
import signs from "../data/animals.js";
import { renderZodiacCard } from "./card.js";

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
