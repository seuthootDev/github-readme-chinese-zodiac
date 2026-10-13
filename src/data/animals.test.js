import { describe, it } from "node:test";
import assert from "node:assert/strict";
import animals from "./animals.js";

const HEX = /^#[0-9a-f]{6}$/i;

describe("animal data for the cute theme", () => {
  it("gives every animal pinyin and a bg/mid/accent palette", () => {
    assert.equal(animals.length, 12);
    for (const a of animals) {
      assert.match(a.pinyin ?? "", /^\p{L}+$/u, `${a.id} pinyin`);
      for (const key of ["bg", "mid", "accent"]) {
        assert.match(a.cuteColors?.[key] ?? "", HEX, `${a.id} cuteColors.${key}`);
      }
    }
  });

  it("uses the spec values (pig spot check)", () => {
    const pig = animals.find((a) => a.id === "pig");
    assert.equal(pig.pinyin, "zhū");
    assert.deepEqual(pig.cuteColors, { bg: "#fff4f7", mid: "#ffd2dd", accent: "#ff8fa3" });
  });

  it("keeps the classic palette untouched", () => {
    const rat = animals.find((a) => a.id === "rat");
    assert.equal(rat.colors.accent, "#c9a227");
  });
});
