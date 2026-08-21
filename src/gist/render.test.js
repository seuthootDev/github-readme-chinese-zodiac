import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderGistCard } from "./render.js";

const zodiac = {
  id: "rat",
  sign: "Rat",
  symbol: "🐀",
  element: "Water",
  earthlyBranch: "子",
  title: "The Clever Hacker",
  description: "Quick wits.",
  hanzi: "鼠",
  statKeys: ["builder", "explorer", "debugger"],
};

const profile = {
  username: "alice",
  name: "Alice",
  stars: 10,
  publicRepos: 5,
  followers: 3,
  languages: [{ name: "JS" }],
};

describe("renderGistCard stats", () => {
  it("prints unbounded scores without a percent cap and scales bars to the peak", () => {
    const text = renderGistCard({
      profile,
      zodiac,
      stats: {
        builder: 200,
        explorer: 100,
        debugger: 50,
        consistency: 1,
        openSource: 1,
      },
    });

    assert.doesNotMatch(text, /\d+%/);
    assert.match(text, /Craft\s+████████████\s+200/);
    assert.match(text, /Ingenuity\s+██████░░░░░░\s+100/);
    assert.match(text, /Insight\s+███░░░░░░░░░\s+50/);
  });
});
