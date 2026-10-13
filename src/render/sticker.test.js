import { describe, it } from "node:test";
import assert from "node:assert/strict";
import animals from "../data/animals.js";
import cuteAnimals from "../data/cute-animals.js";
import { renderSticker, STICKER_INK } from "./sticker.js";
import { assertBalancedTags } from "./assert-svg.js";

describe("renderSticker", () => {
  const def = {
    silhouette: [{ tag: "circle", attrs: { cx: 60, cy: 60, r: 40 }, fill: "#ffc8d3" }],
    details: ['<circle cx="50" cy="55" r="4" fill="#5a3d35"/>'],
  };

  it("stacks shadow, white border, outlined body, then details", () => {
    const svg = renderSticker(def);
    const order = ["sticker-shadow", "sticker-border", "sticker-body", "sticker-details"].map(
      (cls) => svg.indexOf(`class="${cls}"`),
    );
    assert.ok(order.every((i) => i >= 0), "missing layer");
    assert.deepEqual([...order].sort((a, b) => a - b), order, "layers out of order");
    assert.match(svg, /class="sticker-shadow" transform="translate\(2 3\)"[^>]*stroke-width="14"[^>]*opacity="0.12"/);
    assert.match(svg, /class="sticker-border" fill="#ffffff" stroke="#ffffff" stroke-width="14"/);
    assert.match(svg, new RegExp(`class="sticker-body" stroke="${STICKER_INK}" stroke-width="3"`));
    assert.match(svg, /<circle cx="60" cy="60" r="40" fill="#ffc8d3"\/>/);
    assertBalancedTags(svg);
  });

  it("only gives the colored fill to the body layer", () => {
    const svg = renderSticker(def);
    assert.equal(svg.split('fill="#ffc8d3"').length - 1, 1);
  });
});

describe("cute-animals", () => {
  it("defines a sticker for every zodiac animal", () => {
    assert.deepEqual(Object.keys(cuteAnimals).sort(), animals.map((a) => a.id).sort());
  });

  it("every character renders well-formed with hex fills", () => {
    for (const [id, def] of Object.entries(cuteAnimals)) {
      assert.ok(def.silhouette.length > 0, `${id} silhouette`);
      assert.ok(def.details.length > 0, `${id} details`);
      for (const s of def.silhouette) assert.match(s.fill, /^#[0-9a-f]{6}$/i, `${id} fill`);
      assertBalancedTags(renderSticker(def));
    }
  });
});
