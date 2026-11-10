const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ctx = vm.createContext({ window: {}, console });
vm.runInContext(
  fs
    .readFileSync("js/data.js", "utf8")
    .replace(
      "window.VOP = window.VOP || {};",
      "var VOP = window.VOP = window.VOP || {};",
    ),
  ctx,
);
vm.runInContext(fs.readFileSync("js/learning.js", "utf8"), ctx);
const V = ctx.VOP;
const now = Date.now();
function word(level = 2, extra = {}) {
  return {
    id: "test",
    word: "resilient",
    meaning: "kiên cường",
    example: "She is resilient.",
    level,
    due: now - 1,
    created: now - 100,
    lapses: 0,
    maintenance: 0,
    ...extra,
  };
}
function complete(words, s, wrongId = null) {
  let guard = 0;
  while (s.index < s.queue.length && guard++ < 100) {
    const q = s.queue[s.index],
      w = s.selected.find((w) => w.id === q.wordId);
    V.recordAnswer(
      s,
      q.wordId === wrongId && !q.repair
        ? "wrong"
        : q.type === "meaning"
          ? w.meaning
          : w.word,
    );
    s.index++;
  }
  return V.finishSession(words, s, now);
}
test("seed has exactly 48 unique entries and counts add up", () => {
  const s = V.seed();
  assert.equal(s.words.length, 48);
  assert.equal(new Set(s.words.map((w) => w.word)).size, 48);
  assert.equal(s.words.filter((w) => !w.level).length, 8);
  assert.equal(s.words.filter((w) => w.level > 0 && w.due <= now).length, 12);
});
test("session picks 8 due + 4 new, never not-yet-due words", () => {
  const s = V.seed(),
    selected = V.selectWords(s.words);
  assert.equal(selected.length, 12);
  assert.equal(selected.filter((w) => !w.level).length, 4);
  assert.ok(selected.every((w) => !w.level || w.due <= Date.now()));
});
test("queue covers all four exercise types with spaced new-word checks", () => {
  const s = V.createSession(V.seed().words, true);
  assert.equal(new Set(s.queue.map((q) => q.type)).size, 4);
  s.selected
    .filter((w) => !w.level)
    .forEach((w) => {
      const positions = s.queue.flatMap((q, i) =>
        q.wordId === w.id ? [i] : [],
      );
      assert.equal(positions.length, 2);
      assert.ok(positions[1] - positions[0] >= 5);
    });
});
test("blank matching supports phrases, boundary checks and regex characters", () => {
  assert.equal(V.blankExample(word()), "She is ________.");
  assert.equal(
    V.blankExample(
      word(0, { word: "take off", example: "Planes take off here." }),
    ),
    "Planes ________ here.",
  );
  assert.equal(
    V.blankExample(word(0, { word: "art", example: "A smart person." })),
    null,
  );
  assert.equal(
    V.blankExample(word(0, { word: "C++", example: "I use C++ daily." })),
    "I use ________ daily.",
  );
});
test("missing context and audio fall back to meaning exercises", () => {
  const words = Array.from({ length: 4 }, (_, i) =>
    word(1, { id: "w" + i, word: "w" + i, example: "" }),
  );
  const s = V.createSession(words, false);
  assert.ok(s.queue.every((q) => q.type === "meaning"));
});
test("valid due review advances exactly one level", () => {
  const w = word(),
    s = V.createSession([w], false, now),
    r = complete([w], s);
  assert.equal(r.words[0].level, 3);
  assert.equal(r.words[0].due, now + V.INTERVALS[3]);
});
test("wrong assessment drops once and repair does not promote", () => {
  const w = word(4),
    s = V.createSession([w], false, now),
    r = complete([w], s, w.id);
  assert.equal(r.words[0].level, 3);
  assert.equal(r.words[0].lapses, 1);
  assert.equal(r.words[0].due, now + V.INTERVALS[1]);
  assert.equal(s.queue.length, 2);
  assert.equal(s.correct, 1);
});
test("repeated wrong word schedules at most one repair, bounded session", () => {
  const w = word(0),
    s = V.createSession([w], false, now),
    r = complete([w], s, w.id);
  assert.equal(s.retryScheduled.length, 1);
  assert.equal(s.queue.length, 3);
  assert.equal(r.words[0].level, 0);
});
test("new word needs two successful checks including meaning or context", () => {
  const w = word(0),
    s = V.createSession([w], false, now),
    r = complete([w], s);
  assert.equal(r.words[0].level, 1);
  assert.equal(r.summary.newWords, 1);
  assert.equal(r.words[0].due, now + V.INTERVALS[1]);
});
test("one correct new-word answer is not enough", () => {
  const w = word(0),
    s = V.createSession([w], false, now);
  s.outcomes[w.id].correct = 1;
  s.outcomes[w.id].semantic = true;
  assert.equal(V.finishSession([w], s, now).words[0].level, 0);
});
test("audio spelling success alone cannot promote", () => {
  const w = word(2),
    s = V.createSession([w], false, now);
  s.outcomes[w.id].correct = 2;
  s.outcomes[w.id].semantic = false;
  assert.equal(V.finishSession([w], s, now).words[0].level, 2);
});
test("Level 1 errors never reset a learned word to unlearned", () => {
  const w = word(1),
    r = complete([w], V.createSession([w], false, now), w.id);
  assert.equal(r.words[0].level, 1);
});
test("Level 5 maintenance stays at 5 and uses 7 then 14 days", () => {
  const w = word(5),
    r = complete([w], V.createSession([w], false, now));
  assert.equal(r.words[0].level, 5);
  assert.equal(r.words[0].due, now + 7 * 86400000);
  const later = word(5, { ...r.words[0], due: now - 1 });
  const r2 = complete([later], V.createSession([later], false, now));
  assert.equal(r2.words[0].due, now + 14 * 86400000);
});
test("forgotten Level 5 can decrease to Level 4", () => {
  const w = word(5),
    r = complete([w], V.createSession([w], false, now), w.id);
  assert.equal(r.words[0].level, 4);
});
test("empty or not-due-only vocabulary does not force a fake review", () => {
  assert.equal(V.selectWords([]).length, 0);
  assert.equal(V.selectWords([word(5, { due: now + 86400000 })]).length, 0);
});
test("answer normalization tolerates case whitespace and punctuation", () => {
  assert.equal(V.normal("  RESILIENT!  "), V.normal("resilient"));
  assert.equal(V.normal("take  off"), V.normal("Take off"));
});
test("validation rejects blanks and case-insensitive duplicate words", () => {
  const w = word();
  assert.ok(V.validateWord({ word: " ", meaning: "m" }, [w]));
  assert.ok(V.validateWord({ word: " Resilient ", meaning: "m" }, [w]));
  assert.equal(
    V.validateWord({ word: "resilient", meaning: "m" }, [w], w.id),
    "",
  );
});
test("HTML escapes user content before rendering", () => {
  assert.equal(
    V.escape('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  );
});
