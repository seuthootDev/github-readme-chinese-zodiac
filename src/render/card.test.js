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
