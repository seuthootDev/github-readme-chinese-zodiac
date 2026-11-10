import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { yearGanzhi, yearMarkFor } from "./ganzhi.js";

const utc = (s) => new Date(`${s}T12:00:00Z`);

describe("yearGanzhi", () => {
  it("2026 is 丙午, the red horse", () => {
    const g = yearGanzhi(utc("2026-11-10"));
    assert.equal(g.year, 2026);
    assert.equal(g.ganzhi, "丙午");
    assert.equal(g.signId, "horse");
    assert.equal(g.color, "red");
  });

  it("covers every element color across the next years", () => {
    const got = [2027, 2028, 2029, 2030, 2031, 2032, 2034].map((y) => {
      const g = yearGanzhi(utc(`${y}-06-01`));
      return `${g.ganzhi} ${g.color} ${g.signId}`;
    });
    assert.deepEqual(got, [
      "丁未 red goat",
      "戊申 gold monkey",
      "己酉 gold rooster",
      "庚戌 white dog",
      "辛亥 white pig",
      "壬子 black rat",
      "甲寅 blue tiger",
    ]);
  });

  it("2019 is the golden pig", () => {
    const g = yearGanzhi(utc("2019-06-01"));
    assert.equal(g.ganzhi, "己亥");
    assert.equal(g.color, "gold");
  });

  it("switches years on Feb 4 (입춘), matching the birthdate rule", () => {
    assert.equal(yearGanzhi(utc("2027-02-03")).ganzhi, "丙午");
    assert.equal(yearGanzhi(utc("2027-02-04")).ganzhi, "丁未");
    assert.equal(yearGanzhi(utc("2027-01-15")).year, 2026);
  });
});

describe("yearMarkFor", () => {
  it("marks the card whose animal rules the current year", () => {
    const mark = yearMarkFor("horse", utc("2026-11-10"));
    assert.equal(mark.year, 2026);
    assert.equal(mark.ganzhi, "丙午");
    assert.equal(mark.color, "red");
    assert.equal(mark.label, "RED HORSE YEAR");
  });

  it("uses GOLDEN in the label for earth years", () => {
    assert.equal(yearMarkFor("monkey", utc("2028-06-01")).label, "GOLDEN MONKEY YEAR");
  });

  it("returns null for every other animal", () => {
    assert.equal(yearMarkFor("pig", utc("2026-11-10")), null);
    assert.equal(yearMarkFor("goat", utc("2026-11-10")), null);
    assert.equal(yearMarkFor(undefined, utc("2026-11-10")), null);
  });
});
