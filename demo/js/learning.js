"use strict";
(function (V) {
  V.selectWords = (words, now = Date.now()) => {
    const due = words
      .filter((w) => w.level > 0 && w.due <= now)
      .sort((a, b) => a.due - b.due);
    const fresh = words
      .filter((w) => w.level === 0)
      .sort((a, b) => a.created - b.created);
    const oldCount = Math.min(due.length, fresh.length ? 8 : 12);
    const selected = due.slice(0, oldCount);
    const newcomers = fresh.slice(0, 12 - selected.length);
    // Interleave due words and newcomers without pulling in words before their due date.
    const result = [];
    while (selected.length || newcomers.length) {
      if (selected.length) result.push(selected.shift());
      if (selected.length) result.push(selected.shift());
      if (newcomers.length) result.push(newcomers.shift());
    }
    if (result.length < 12)
      result.push(...due.slice(oldCount, oldCount + 12 - result.length));
    return result;
  };
  V.blankExample = (w) => {
    if (!w.example) return null;
    const escaped = w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      "(^|[^\\p{L}])(" + escaped + ")(?=$|[^\\p{L}])",
      "iu",
    );
    if (!regex.test(w.example)) return null;
    return w.example.replace(regex, (_, before) => before + "________");
  };
  V.createSession = (words, audio = true, now = Date.now()) => {
    const selected = V.selectWords(words, now);
    const queue = [],
      outcomes = {};
    selected.forEach((w, i) => {
      let type = ["meaning", "listen-choice", "dictation", "fill"][i % 4];
      if (
        (!audio && type.startsWith("listen")) ||
        (!audio && type === "dictation")
      )
        type = "meaning";
      if (type === "fill" && !V.blankExample(w)) type = "meaning";
      queue.push({ wordId: w.id, type, repair: false });
      outcomes[w.id] = {
        correct: 0,
        failed: false,
        semantic: false,
        initial: w.level,
      };
    });
    // A second separated round verifies semantics for audio-only checks and new-word intake.
    selected.forEach((w, i) => {
      const first = queue[i].type;
      if (w.level === 0 || first === "dictation" || first === "listen-choice") {
        let type =
          first === "meaning" && V.blankExample(w) ? "fill" : "meaning";
        queue.push({ wordId: w.id, type, repair: false });
      }
    });
    return {
      selected: selected.map((w) => ({ ...w })),
      queue,
      outcomes,
      index: 0,
      answers: 0,
      correct: 0,
      started: now,
      answerLog: [],
      retryScheduled: [],
      id: "session-" + now,
    };
  };
  V.recordAnswer = (session, answer, now = Date.now()) => {
    const q = session.queue[session.index];
    const w = session.selected.find((w) => w.id === q.wordId);
    const correct =
      V.normal(answer) === V.normal(q.type === "meaning" ? w.meaning : w.word);
    session.answers++;
    if (correct) session.correct++;
    session.answerLog.push({
      wordId: w.id,
      type: q.type,
      repair: q.repair,
      correct,
      at: now,
    });
    if (!q.repair) {
      const o = session.outcomes[w.id];
      if (correct) {
        o.correct++;
        if (q.type === "meaning" || q.type === "fill") o.semantic = true;
      } else {
        o.failed = true;
        if (!session.retryScheduled.includes(w.id)) {
          session.retryScheduled.push(w.id);
          const type =
            q.type === "meaning" && V.blankExample(w) ? "fill" : "meaning";
          session.queue.splice(
            Math.min(session.index + 6, session.queue.length),
            0,
            { wordId: w.id, type, repair: true },
          );
        }
      }
    }
    return {
      correct,
      word: w,
      question: q,
      expected: q.type === "meaning" ? w.meaning : w.word,
    };
  };
  V.finishSession = (words, session, now = Date.now()) => {
    const changes = [];
    const updated = words.map((w) => {
      const o = session.outcomes[w.id];
      if (!o) return w;
      const old = session.selected.find((x) => x.id === w.id);
      // Any failed assessment blocks promotion; repair answers never award a level.
      let level = w.level;
      if (o.failed && w.level > 0) level = Math.max(1, w.level - 1);
      else if (
        !o.failed &&
        o.semantic &&
        o.correct >= (old.level === 0 ? 2 : 1) &&
        (old.level === 0 || old.due <= session.started)
      )
        level = Math.min(5, w.level + 1);
      const maintenance =
        level === 5 && !o.failed ? (w.maintenance || 0) + 1 : 0;
      const interval = o.failed
        ? V.INTERVALS[1]
        : level === 5 && old.level === 5 && maintenance > 1
          ? 14 * 86400000
          : V.INTERVALS[level];
      const next = {
        ...w,
        level,
        due: level > 0 ? now + interval : null,
        lapses: (w.lapses || 0) + (o.failed ? 1 : 0),
        maintenance,
        lastReviewed: now,
      };
      changes.push({
        word: w.word,
        from: w.level,
        to: level,
        failed: o.failed,
      });
      return next;
    });
    return {
      words: updated,
      changes,
      summary: {
        id: session.id,
        date: now,
        answers: session.answers,
        correct: session.correct,
        words: session.selected.length,
        newWords: changes.filter((c) => c.from === 0 && c.to === 1).length,
        duration: now - session.started,
      },
    };
  };
  V.validateWord = (values, words, id) => {
    if (!values.word.trim() || !values.meaning.trim())
      return "Hãy nhập từ tiếng Anh và nghĩa tiếng Việt.";
    if (values.word.trim().length > 80)
      return "Từ hoặc cụm từ tối đa 80 ký tự.";
    if (values.meaning.trim().length > 300)
      return "Nghĩa tiếng Việt tối đa 300 ký tự.";
    if (
      words.some(
        (w) => w.id !== id && V.normal(w.word) === V.normal(values.word),
      )
    )
      return "Từ này đã có trong kho. Bạn có thể mở từ để sửa nghĩa.";
    return "";
  };
})(VOP);
