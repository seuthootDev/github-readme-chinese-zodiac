import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dailyForecast } from "./forecast.js";
import { currentStreak } from "./github.js";

describe("dailyForecast", () => {
  const base = {
    username: "alice",
    signId: "rat",
    languages: [{ name: "Go" }, { name: "Rust" }],
  };

  it("is stable within a UTC day", () => {
    const a = dailyForecast({ ...base, date: new Date("2026-10-27T01:00:00Z") });
    const b = dailyForecast({ ...base, date: new Date("2026-10-27T23:00:00Z") });
    assert.deepEqual(a, b);
    assert.equal(a.dateLabel, "Oct 27");
  });

  it("picks the lucky language from the user's own languages", () => {
    for (let d = 1; d <= 20; d++) {
      const f = dailyForecast({ ...base, date: new Date(Date.UTC(2026, 0, d)) });
      assert.ok(["Go", "Rust"].includes(f.luckyLanguage));
    }
  });

  it("changes across days", () => {
    const seen = new Set();
    for (let d = 1; d <= 10; d++) {
      seen.add(dailyForecast({ ...base, date: new Date(Date.UTC(2026, 0, d)) }).advice);
    }
    assert.ok(seen.size > 1);
  });
});

describe("currentStreak", () => {
  const day = (date, count) => ({ date, count });

  it("counts back from today", () => {
    assert.equal(
      currentStreak([day("2026-10-25", 0), day("2026-10-26", 2), day("2026-10-27", 1)]),
      2,
    );
  });

  it("keeps yesterday's streak while today is still empty", () => {
    assert.equal(
      currentStreak([day("2026-10-25", 1), day("2026-10-26", 3), day("2026-10-27", 0)]),
      2,
    );
  });

  it("is zero after a missed day", () => {
    assert.equal(
      currentStreak([day("2026-10-25", 1), day("2026-10-26", 0), day("2026-10-27", 0)]),
      0,
    );
  });
});
