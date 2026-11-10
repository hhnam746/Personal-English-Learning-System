"use strict";
(function (V) {
  const e = V.escape;
  // Local thin-outline SVG geometry inspired by Phosphor Light. Controls have text/labels.
  const paths = {
    layers: "M128 24 24 80l104 56 104-56ZM24 128l104 56 104-56M24 176l104 56 104-56",
    play: "M88 48 208 128 88 208Z",
    calendar:
      "M40 56h176v168H40zM80 32v48m96-48v48M40 104h176M88 144h32v32H88z",
    home: "M32 112 128 32l96 80M56 96v112h48v-64h48v64h48V96",
    book: "M128 56v160M128 56C96 32 48 32 24 40v160c32-8 72-8 104 16 32-24 72-24 104-16V40c-24-8-72-8-104 16Z",
    bolt: "m144 16-96 128h72l-8 96 96-128h-72Z",
    chart: "M48 208v-64m56 64V96m56 112V48m56 160H24",
    plus: "M128 48v160M48 128h160",
    arrow: "M40 128h176m-72-72 72 72-72 72",
    chevron: "m96 48 80 80-80 80",
    sun: "M128 80a48 48 0 1 0 0 96 48 48 0 0 0 0-96M128 16v24m0 176v24M16 128h24m176 0h24M48 48l16 16m128 128 16 16M48 208l16-16M192 64l16-16",
    moon: "M216 152A96 96 0 0 1 104 40a96 96 0 1 0 112 112Z",
    search: "M112 40a72 72 0 1 0 0 144 72 72 0 0 0 0-144m52 124 60 60",
    sound: "M112 48 56 96H24v64h32l56 48Zm40 48q32 32 0 64m32-96q64 64 0 128",
    close: "m56 56 144 144M56 200 200 56",
    check: "m48 128 56 56L208 72",
    edit: "m160 40 56 56M48 160 184 24l48 48L96 208l-64 16Z",
    trash:
      "M40 64h176M96 64V32h64v32M64 64l8 160h112l8-160M104 104v80m48-80v80",
    flip: "M40 80a96 96 0 0 1 168-16l24 32m0-64v64h-64M216 176a96 96 0 0 1-168 16l-24-32m0 64v-64h64",
    info: "M128 24a104 104 0 1 0 0 208 104 104 0 0 0 0-208M128 112v64m0-100v4",
    clock: "M128 24a104 104 0 1 0 0 208 104 104 0 0 0 0-208m0 40v64l40 24",
    leaf: "M224 32C96 8 16 112 80 176s168-16 144-144ZM48 208 176 80",
    target:
      "M128 24a104 104 0 1 0 0 208 104 104 0 0 0 0-208m0 48a56 56 0 1 0 0 112 56 56 0 0 0 0-112m0 40a16 16 0 1 0 0 32 16 16 0 0 0 0-32",
    menu: "M40 80h176M40 176h176",
    back: "M216 128H40m72-72-72 72 72 72",
    spark: "m128 24 24 72 72 24-72 24-24 72-24-72-72-24 72-24Z",
    filter: "M32 56h192M64 128h128m-88 72h48",
    plant:
      "M128 224V112m0 40C32 160 24 64 32 32c64 0 104 24 96 120Zm0 32c72 0 112-56 96-112-64 0-96 40-96 112Z",
  };
  V.icon = (name, cls = "") =>
    `<svg class="icon ${cls}" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
  V.button = (
    text,
    action,
    primary = false,
    icon = "arrow",
    attrs = "",
  ) =>
    `<button class="btn ${primary ? "btn-primary" : "btn-secondary"} " data-action="${action}" ${attrs}>${text}${icon ? `<span class="btn-icon">${V.icon(icon)}</span>` : ""}</button>`;
  V.level = (l) =>
    `<span class="level-tag level-${l}"><span></span>${l ? "Level " + l : "Chưa học"}</span>`;
  V.empty = (title, text, action = "add", label = "Thêm từ mới") =>
    `<div class="empty-state glass-panel">${V.icon("plant")}<h2>${title}</h2><p>${text}</p>${V.button(label, action, true)}</div>`;
  V.dueText = (w) =>
    !w.level
      ? "Chờ học lần đầu"
      : w.due <= Date.now()
        ? "Đến hạn ôn"
        : new Intl.DateTimeFormat("vi-VN", {
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(w.due));
  V.nav = [
    ["dashboard", "home", "Tổng quan"],
    ["library", "book", "Kho từ vựng"],
    ["practice", "bolt", "Luyện tập"],
    ["flashcards", "layers", "Flashcard"],
    ["progress", "chart", "Tiến độ"],
  ];
  V.shell = (view, content) =>
    `<aside class="sidebar"><a href="#dashboard" class="brand" aria-label="VOP — Tổng quan">vop<span>•</span></a><div class="sidebar-label">Không gian của bạn</div><nav aria-label="Điều hướng chính">${V.nav.map(([id, icon, label]) => `<a href="#${id}" ${view === id ? 'aria-current="page"' : ""} aria-label="${label}" class="nav-item ${view === id ? "active" : ""}">${V.icon(icon)}<span>${label}</span>${id === "practice" ? '<i class="nav-dot"></i>' : ""}</a>`).join("")}</nav><div class="sidebar-bottom"><div class="personal-mark">${V.icon("leaf")}<span>Học theo nhịp<br><strong>của riêng bạn.</strong></span></div><button class="theme-toggle" data-action="theme" aria-label="Chuyển giao diện sáng hoặc tối">${V.icon("sun")}<span>Giao diện</span><span class="theme-track">${V.icon("moon")}</span></button><button class="demo-info" data-action="about">${V.icon("info")}<span>Về bản demo</span></button></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb">${V.icon("calendar")}<span>${new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span></div><div class="top-actions"><label class="top-search glass-control">${V.icon("search")}<input id="global-search" type="search" placeholder="Tìm từ vựng…" aria-label="Tìm trong kho từ"><kbd>/</kbd></label><button class="mobile-theme icon-button" data-action="theme" aria-label="Đổi giao diện">${V.icon("sun")}</button>${V.button(V.icon("plus") + "Thêm từ mới", "add", true, "")}</div></header><main id="main" tabindex="-1">${content}</main><footer class="app-footer"><span><i></i> Bản demo cá nhân</span><span>Lưu trên thiết bị ${V.icon("check")}</span></footer></div><nav class="mobile-nav" aria-label="Điều hướng di động">${V.nav.map(([id, icon, label]) => `<a href="#${id}" class="${view === id ? "active" : ""}" ${view === id ? 'aria-current="page"' : ""}>${V.icon(icon)}<span>${id === "library" ? "Kho từ" : id === "dashboard" ? "Tổng quan" : label}</span></a>`).join("")}</nav>`;
  V.heading = (title, desc = "", right = "") =>
    `<div class="page-heading"><div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${right}</div>`;
  V.memoryChart = (words) => {
    const counts = [1, 2, 3, 4, 5].map(
        (l) => words.filter((w) => w.level === l).length,
      ),
      max = Math.max(...counts, 1);
    return `<div class="memory-chart" role="group" aria-label="Phân bố từ theo 5 cấp độ ghi nhớ">${counts.map((count, i) => `<button class="memory-column level-${i + 1}" data-action="level" data-level="${i + 1}" aria-label="Level ${i + 1}: ${count} từ. Xem các từ."><span class="bar-count">${count}</span><span class="memory-bar" style="--bar-height:${count ? Math.max(18, (count / max) * 100) : 1}%"><span class="bar-highlight"></span><span class="bar-glyph">${["·", "⋮", "∴", "⁖", "✳"][i]}</span></span><span class="bar-label">Level ${i + 1}</span></button>`).join("")}</div>`;
  };
  V.dashboard = (state, period = 7) => {
    const words = state.words,
      learned = words.filter((w) => w.level > 0).length,
      fresh = words.length - learned;
    const due = words
      .filter((w) => w.level > 0 && w.due <= Date.now())
      .sort((a, b) => a.due - b.due);
    const total = state.sessions.reduce((n, s) => n + s.answers, 0),
      correct = state.sessions.reduce((n, s) => n + s.correct, 0),
      accuracy = total ? Math.round((correct / total) * 100) : 0;
    return (
      V.heading(
        'Tiếp tục <span class="orange-word">hành trình</span> nhé!',
      ) +
      `<div class="dashboard-composition"><div class="dashboard-top">${V.organicBlob({ variant: "summary", tag: "section", className: "vocabulary-summary", labelledBy: "vocabulary-title", content: `<h2 id="vocabulary-title">Tổng số từ vựng</h2><div class="vocab-total"><strong>${words.length}</strong></div><div class="meter" role="progressbar" aria-label="Tỷ lệ từ đã bắt đầu học" aria-valuenow="${learned}" aria-valuemin="0" aria-valuemax="${Math.max(words.length, 1)}" style="--progress:${words.length ? (learned / words.length) * 100 : 0}%"><span></span></div><div class="vocab-breakdown"><span>${V.icon("book")} Đã học <strong>${learned}</strong> từ</span><button class="text-link" data-action="level" data-level="0">Chưa học <strong>${fresh}</strong> từ</button></div>` })}<section class="memory-distribution" aria-labelledby="memory-title"><h2 id="memory-title">${V.icon("layers")} Phân bố theo mức ghi nhớ</h2>${V.memoryChart(words)}</section><section class="surface surface-accent upcoming-panel"><h2>${V.icon("calendar")} Đến lúc ôn lại</h2><div class="review-total"><strong>${due.length}</strong><span>từ đang chờ bạn</span></div><div class="due-words">${
        due
          .slice(0, 3)
          .map(
            (w) =>
              `<button class="word-chip" data-action="detail" data-id="${e(w.id)}">${e(w.word)}</button>`,
          )
          .join("") || '<span class="muted">Chưa có từ đến hạn.</span>'
      }</div>${V.button(V.icon("play") + "Bắt đầu luyện tập", "start", true, "arrow", "")}<button class="text-link review-footer" data-action="filter-due">${V.icon("clock")} Xem ${due.length} từ đến hạn ${V.icon("arrow")}</button></section></div><div class="dashboard-bottom"><section class="surface dashboard-activity"><div class="panel-top"><h2>${V.icon("chart")} Hoạt động học tập</h2><select class="glass-control" id="activity-period" aria-label="Khoảng thời gian hoạt động"><option value="7" ${period === 7 ? "selected" : ""}>7 ngày gần đây</option><option value="14" ${period === 14 ? "selected" : ""}>14 ngày gần đây</option></select></div>${V.activity(state.sessions, period, true)}</section>${V.organicBlob({ variant: "accuracy", tag: "section", className: "accuracy-panel accuracy-panel--with-brain", content: `<h2>${V.icon("target")} Tỷ lệ trả lời đúng</h2><strong class="accuracy-total">${accuracy}<span>%</span></strong><p>${correct} / ${total} lượt trả lời</p><div class="meter" role="progressbar" aria-label="Tỷ lệ trả lời đúng" aria-valuenow="${accuracy}" aria-valuemin="0" aria-valuemax="100" style="--progress:${accuracy}%"><span></span></div>${V.organicBlob({ variant: "brain", decorative: true, content: V.brainIllustration() })}` })}</div></div>`
    );
  };
  V.library = (state, filter = "", search = "", sort = "recent") => {
    let words = state.words.filter(
      (w) =>
        (filter === "" ||
          String(w.level) === filter ||
          (filter === "due" && w.level > 0 && w.due <= Date.now())) &&
        V.normal(w.word + " " + w.meaning).includes(V.normal(search)),
    );
    words.sort(
      sort === "alpha"
        ? (a, b) => a.word.localeCompare(b.word)
        : sort === "level"
          ? (a, b) => a.level - b.level
          : (a, b) => b.created - a.created,
    );
    return (
      V.heading(
        "Kho từ vựng",
        "Thêm, tìm kiếm và chỉnh sửa từ đã lưu.",
        `<div class="heading-count">${state.words.length}<span>từ đã lưu</span></div>`,
      ) +
      `<div class="library-tools"><label class="search-input glass-control">${V.icon("search")}<input id="word-search" type="search" placeholder="Tìm từ hoặc nghĩa tiếng Việt…" value="${e(search)}" autocomplete="off"><kbd>/</kbd></label><select class="glass-control" id="word-sort" aria-label="Sắp xếp từ"><option value="recent" ${sort === "recent" ? "selected" : ""}>Mới thêm gần đây</option><option value="alpha" ${sort === "alpha" ? "selected" : ""}>Từ A đến Z</option><option value="level" ${sort === "level" ? "selected" : ""}>Cấp độ tăng dần</option></select></div><div class="filter-tabs glass-segmented" aria-label="Lọc theo cấp độ"><button data-action="filter" data-filter="" class="${filter === "" ? "selected" : ""}">Tất cả <span>${state.words.length}</span></button><button data-action="filter" data-filter="due" class="${filter === "due" ? "selected" : ""}">Đến hạn</button><button data-action="filter" data-filter="0" class="${filter === "0" ? "selected" : ""}">Chưa học</button>${[1, 2, 3, 4, 5].map((l) => `<button data-action="filter" data-filter="${l}" class="${filter === String(l) ? "selected" : ""}">Level ${l}</button>`).join("")}</div><div id="library-results">${V.wordTable(words, state.words.length)}</div>`
    );
  };
  V.wordTable = (words, total) =>
    words.length
      ? `<div class="table-container glass-panel"><table class="word-table"><thead><tr><th>Từ vựng / Phát âm</th><th>Nghĩa tiếng Việt</th><th>Ghi nhớ</th><th>Lịch ôn</th><th><span class="sr-only">Thao tác</span></th></tr></thead><tbody>${words.map((w) => `<tr><td><div class="table-word"><button data-action="detail" data-id="${e(w.id)}"><strong>${e(w.word)}</strong><span>${e(w.ipa) || "Chưa có IPA"}</span></button><button class="icon-button" data-action="speak" data-id="${e(w.id)}" aria-label="Phát âm ${e(w.word)}">${V.icon("sound")}</button></div></td><td class="meaning-cell">${e(w.meaning)}</td><td>${V.level(w.level)}</td><td><span class="due-label ${w.level && w.due <= Date.now() ? "is-due" : ""}">${V.dueText(w)}</span></td><td><div class="row-actions"><button class="icon-button" data-action="edit" data-id="${e(w.id)}" aria-label="Sửa ${e(w.word)}">${V.icon("edit")}</button><button class="icon-button danger-hover" data-action="delete" data-id="${e(w.id)}" aria-label="Xóa ${e(w.word)}">${V.icon("trash")}</button></div></td></tr>`).join("")}</tbody></table></div><div class="list-footer">Hiển thị ${words.length} / ${total} từ <span>Chạm vào một từ để xem ví dụ.</span></div>`
      : V.empty(
          total ? "Không tìm thấy từ." : "Kho từ đang trống.",
          total
            ? "Thử một từ khóa hoặc cấp độ khác."
            : "Lưu từ tiếng Anh đầu tiên cùng nghĩa tiếng Việt.",
          total ? "clear-filters" : "add",
          total ? "Xóa bộ lọc" : "Thêm từ mới",
        );
  V.practiceSetup = (state) => {
    const selected = V.selectWords(state.words),
      fresh = selected.filter((w) => !w.level).length;
    return (
      V.heading("Luyện tập", "Ôn từ đến hạn và học từ mới.") +
      `<div class="practice-setup"><div class="session-intro glass-panel glass-panel--peach"><div class="session-intro__heading"><span class="round-emblem">${V.icon("bolt")}</span><h2>Nội dung luyện tập</h2></div><div class="session-facts"><span><strong>${selected.length - fresh}</strong> từ đến hạn</span><span><strong>${fresh}</strong> từ chưa học</span><span><strong>4</strong> dạng bài</span></div>${V.button("Bắt đầu luyện tập", "begin", true, "arrow", selected.length ? "" : "disabled")}<p class="setup-note">${selected.length ? "Số câu hỏi có thể nhiều hơn số từ." : "Chưa có từ đến hạn hoặc từ mới. Bạn có thể dùng Flashcard để ôn tự do."}</p></div><div class="session-plan glass-panel"><h3>Nội dung trong phiên</h3><div class="session-word-list">${selected.map((w) => `<div><span>${e(w.word)}</span>${V.level(w.level)}</div>`).join("") || '<p class="muted">Các từ sẽ xuất hiện khi đến lịch ôn.</p>'}</div><button data-action="about" class="proposal-note">${V.icon("info")}<span>Phiên tối đa 12 từ và lịch ôn là mặc định thử nghiệm, chưa phải quy tắc đã chốt.</span></button></div></div>`
    );
  };
  V.introduction = (session) => {
    const fresh = session.selected.filter((w) => !w.level);
    return `<div class="learning-header glass-control"><button class="icon-button" data-action="quit" aria-label="Thoát phiên">${V.icon("close")}</button><span>LÀM QUEN TỪ MỚI</span><span>${fresh.length} từ</span></div><div class="new-word-intro"><span class="eyebrow">TRƯỚC KHI LUYỆN NHỚ</span><h1>Từ mới trong phiên</h1><p>Xem nghĩa và ví dụ trước khi bắt đầu câu hỏi.</p><div class="intro-list">${fresh.map((w) => `<article class="glass-panel"><div><h2>${e(w.word)}</h2><span class="muted">${e(w.ipa)}</span></div><button class="icon-button" data-action="session-speak" data-id="${e(w.id)}" aria-label="Phát âm ${e(w.word)}">${V.icon("sound")}</button><p>${e(w.meaning)}</p>${w.example ? `<blockquote>${e(w.example)}</blockquote>` : ""}</article>`).join("")}</div>${V.button("Bắt đầu câu hỏi", "questions", true)}</div>`;
  };
  V.question = (session, answer = "", feedback = null) => {
    const q = session.queue[session.index],
      w = session.selected.find((w) => w.id === q.wordId);
    const titles = {
      meaning: "Chọn nghĩa đúng của từ.",
      "listen-choice": "Nghe và chọn từ bạn nghe được.",
      dictation: "Nghe và gõ lại từ.",
      fill: "Điền từ còn thiếu vào câu.",
    };
    let options = [];
    if (q.type === "meaning" || q.type === "listen-choice") {
      const prop = q.type === "meaning" ? "meaning" : "word";
      const others = [...V.state.words, ...V.seed().words].filter(
        (x) => x.id !== w.id && x[prop] !== w[prop],
      );
      const pool = [...new Set(others.map((x) => x[prop]))];
      const offset = session.index % Math.max(pool.length, 1);
      const distractors = [
        ...pool.slice(offset),
        ...pool.slice(0, offset),
      ].slice(0, 3);
      options = [...distractors];
      options.splice((session.index * 3 + 1) % 4, 0, w[prop]);
    }
    return `<div class="learning-header glass-control"><button class="icon-button" data-action="quit" aria-label="Thoát phiên">${V.icon("close")}</button><div class="question-progress" role="progressbar" aria-valuenow="${session.index}" aria-valuemin="0" aria-valuemax="${session.queue.length}" aria-label="Tiến độ phiên"><span style="transform:scaleX(${session.index / session.queue.length})"></span></div><span class="question-count">${session.index + 1}<span> / ${session.queue.length}</span></span></div><form id="question-form" class="question-content glass-panel"><div class="exercise-label">${V.icon(q.type.startsWith("listen") || q.type === "dictation" ? "sound" : q.type === "fill" ? "edit" : "book")}<span>${q.repair ? "LƯỢT CỦNG CỐ" : { meaning: "CHỌN NGHĨA", "listen-choice": "NGHE VÀ CHỌN", dictation: "NGHE VÀ GÕ", fill: "ĐIỀN TỪ" }[q.type]}</span></div><h1>${titles[q.type]}</h1>${q.type === "meaning" ? `<div class="question-word"><span>${e(w.word)}</span><button type="button" class="icon-button" data-action="session-speak" data-id="${e(w.id)}" aria-label="Nghe phát âm">${V.icon("sound")}</button></div><p class="question-ipa">${e(w.ipa)}</p>` : q.type === "fill" ? `<blockquote class="sentence">${e(V.blankExample(w))}</blockquote><p class="context-hint">Gợi ý nghĩa: ${e(w.meaning)}</p>` : `<button type="button" class="audio-button" data-action="session-speak" data-id="${e(w.id)}" aria-label="Nghe từ cần trả lời">${V.icon("sound")}</button><button type="button" class="audio-fallback text-link" data-action="audio-fallback">Không nghe được? Chuyển sang chọn nghĩa</button>`}${options.length ? `<div class="answer-options">${options.map((o, i) => `<button type="button" class="answer-option glass-control ${answer === o ? "selected" : ""} ${feedback && o === feedback.expected ? "correct-answer" : ""} ${feedback && !feedback.correct && o === answer ? "wrong-answer" : ""}" data-action="answer" data-answer="${e(o)}" ${feedback ? "disabled" : ""}><span class="option-key">${i + 1}</span><span>${e(o)}</span>${answer === o ? V.icon(feedback ? (feedback.correct ? "check" : "close") : "check") : ""}</button>`).join("")}</div>` : `<label class="typing-answer"><span class="sr-only">Nhập đáp án tiếng Anh</span><input class="glass-control" id="typed-answer" placeholder="Nhập từ tiếng Anh…" autocomplete="off" autocapitalize="off" spellcheck="false" value="${e(answer)}" ${feedback ? "disabled" : ""}></label>`}<div class="answer-bottom ${feedback ? (feedback.correct ? "feedback-correct" : "feedback-wrong") : ""}">${feedback ? `<div class="feedback-copy">${V.icon(feedback.correct ? "check" : "info")}<div><strong>${feedback.correct ? "Chính xác." : "Chưa chính xác."}</strong><p>${e(w.word)} — ${e(w.meaning)}</p>${!feedback.correct ? `<small>Đáp án: ${e(feedback.expected)}. Từ này sẽ được củng cố trong phiên.</small>` : ""}</div></div>${V.button(session.index + 1 === session.queue.length ? "Xem kết quả" : "Tiếp tục", "next", true)}` : `<span class="keyboard-hint"><kbd>Enter</kbd> để kiểm tra</span><button type="submit" class="btn btn-primary" id="check-answer" ${answer ? "" : "disabled"}>Kiểm tra<span class="btn-icon">${V.icon("check")}</span></button>`}</div></form>`;
  };
  V.results = (result) =>
    `<div class="result-page glass-panel"><div class="result-emblem">${V.icon("leaf")}</div><h1>Hoàn thành phiên luyện tập</h1><p>Bạn vừa dành thời gian cho ${result.summary.words} từ của riêng mình.</p><div class="result-metrics glass-inset"><div><strong>${Math.round((result.summary.correct / result.summary.answers) * 100)}<small>%</small></strong><span>câu trả lời đúng</span></div><div><strong>${result.summary.answers}</strong><span>lượt trả lời</span></div><div><strong>${result.changes.filter((c) => c.to > c.from).length}</strong><span>từ tăng cấp</span></div></div><div class="result-changes">${result.changes.map((c) => `<div><strong>${e(c.word)}</strong><span>${c.from ? "L" + c.from : "Chưa học"} ${V.icon("arrow")} ${c.to ? "L" + c.to : "Chưa học"} ${c.failed ? '<span class="muted">· ôn sớm</span>' : ""}</span></div>`).join("")}</div><div class="result-actions">${V.button("Về tổng quan", "dashboard", true)}<a class="text-link" href="#progress">Xem tiến độ ${V.icon("arrow")}</a></div><p class="proposal-caption">Cấp độ và lịch ôn áp dụng quy tắc đề xuất của bản demo.</p></div>`;
  V.flashcards = (state, flash) => {
    const words = state.words.filter(
      (w) => flash.filter === "" || String(w.level) === flash.filter,
    );
    const w = words[flash.index];
    return (
      V.heading(
        "Flashcard",
        "Lật thẻ để xem nghĩa và tự đánh giá.",
        `<select class="glass-control" id="flash-filter" aria-label="Lọc thẻ theo cấp độ"><option value="">Tất cả các từ</option>${[0, 1, 2, 3, 4, 5].map((l) => `<option value="${l}" ${flash.filter === String(l) ? "selected" : ""}>${l ? "Level " + l : "Chưa học"}</option>`).join("")}</select>`,
      ) +
      (w
        ? `<div class="flashcard-workspace"><div class="flash-top"><span>${String(flash.index + 1).padStart(2, "0")} <span class="muted">/ ${words.length}</span></span>${V.level(w.level)}</div><div class="flash-bezel"><button class="flashcard ${flash.flipped ? "flipped" : ""}" data-action="flip" aria-label="${flash.flipped ? "Lật về mặt từ" : "Lật thẻ xem nghĩa"}"><span class="flash-face flash-front glass-panel"><span class="eyebrow">THỬ NHỚ NGHĨA CỦA TỪ</span><strong>${e(w.word)}</strong><span class="flash-ipa">${e(w.ipa)}</span><span class="flip-prompt">${V.icon("flip")} Chạm hoặc nhấn Space để lật thẻ</span></span><span class="flash-face flash-back glass-panel glass-panel--peach"><span class="eyebrow">${e(w.word)}</span><strong>${e(w.meaning)}</strong><span class="flash-example">${e(w.example)}</span><span class="flip-prompt">${V.icon("flip")} Lật về mặt từ</span></span></button></div><button class="flash-pronounce text-link" data-action="speak" data-id="${e(w.id)}">${V.icon("sound")} Nghe phát âm</button><div class="flash-self">${flash.flipped ? `<button class="btn btn-secondary" data-action="flash-rate" data-value="no">${V.icon("flip")} Chưa nhớ</button>${V.button("Đã nhớ", "flash-rate", true, "check", 'data-value="yes"')}` : ""}</div><div class="flash-controls"><button class="icon-button" data-action="flash-prev" ${flash.index === 0 ? "disabled" : ""} aria-label="Thẻ trước">${V.icon("back")}</button><div class="flash-dots">${words
            .slice(Math.max(0, flash.index - 3), flash.index + 4)
            .map((x) => `<i class="${x.id === w.id ? "active" : ""}"></i>`)
            .join(
              "",
            )}</div><button class="icon-button" data-action="flash-next" aria-label="Thẻ tiếp theo">${V.icon("arrow")}</button></div><p class="proposal-caption">Tự đánh giá trong demo không thay đổi Level hoặc lịch ôn.</p></div>`
        : V.empty(
            "Chưa có thẻ ở cấp độ này.",
            "Thêm từ hoặc chọn một cấp độ khác.",
          ))
    );
  };
  V.flashResult = (flash) =>
    `<div class="result-page glass-panel"><div class="result-emblem">${V.icon("layers")}</div><h1>Đã xem hết bộ thẻ.</h1><div class="result-metrics glass-inset"><div><strong>${Object.values(flash.ratings).filter(Boolean).length}</strong><span>thẻ đã nhớ</span></div><div><strong>${Object.values(flash.ratings).filter((v) => !v).length}</strong><span>thẻ chưa nhớ</span></div></div>${V.button("Ôn lại bộ thẻ", "flash-restart", true)}<p class="proposal-caption">Level và lịch ôn được giữ nguyên.</p></div>`;
  V.progress = (state) => {
    const learned = state.words.filter((w) => w.level),
      mastered = learned.filter((w) => w.level === 5),
      total = state.sessions.reduce((n, s) => n + s.answers, 0),
      correct = state.sessions.reduce((n, s) => n + s.correct, 0),
      weak = [...learned]
        .sort((a, b) => b.lapses - a.lapses || a.level - b.level)
        .slice(0, 5);
    return (
      V.heading(
        "Tiến độ học tập",
        "Theo dõi cấp độ ghi nhớ và kết quả luyện tập.",
      ) +
      `<div class="progress-overview glass-panel glass-panel--peach"><div class="mastery-number"><span class="eyebrow">TỪ ĐANG Ở LEVEL 5</span><strong>${mastered.length}<span> / ${state.words.length}</span></strong><p>Thành thạo hôm nay, vẫn cần ôn duy trì.</p></div><div class="progress-stats"><div><strong>${learned.length}</strong><span>từ đã bắt đầu học</span></div><div><strong>${total ? Math.round((correct / total) * 100) : 0}%</strong><span>đúng trên ${total} lượt trả lời</span></div></div></div><div class="progress-layout"><section class="bezel level-journey glass-panel"><div class="panel-core"><div class="panel-top"><h2>Hành trình ghi nhớ</h2>${V.icon("plant")}</div>${[
        1, 2, 3, 4, 5,
      ]
        .map((l) => {
          const count = state.words.filter((w) => w.level === l).length;
          return `<button class="journey-row level-${l}" data-action="level" data-level="${l}"><span class="journey-number">0${l}</span><div><strong>${V.LEVELS[l]}</strong><div class="journey-track"><span style="transform:scaleX(${state.words.length ? count / state.words.length : 0})"></span></div></div><span>${count}<small> từ</small></span>${V.icon("chevron")}</button>`;
        })
        .join(
          "",
        )}<p class="proposal-caption">Lịch ôn thử nghiệm: 10 phút → 6 giờ → 1 ngày → 3 ngày → 7 ngày.</p></div></section><section class="weak-words glass-panel"><div class="panel-top"><h2>Cần thêm một lần nhớ</h2>${V.icon("leaf")}</div><p class="muted">Ưu tiên những từ từng trả lời sai hoặc đang ở cấp thấp.</p>${weak.map((w) => `<button class="weak-row" data-action="detail" data-id="${e(w.id)}"><div><strong>${e(w.word)}</strong><span>${e(w.meaning.split(";")[0])}</span></div>${V.level(w.level)}${V.icon("chevron")}</button>`).join("") || "<p>Chưa có từ đã học.</p>"}<div class="maintenance-note glass-inset">${V.icon("info")}<p>Level không tự giảm khi bạn nghỉ học. VOP kiểm tra khả năng nhớ trong lần ôn tiếp theo.</p></div></section></div><section class="history-section glass-panel"><div class="panel-top"><h2>Những phiên gần đây</h2><span class="subtle-label">${state.sessions.length} phiên</span></div>${state.sessions
        .slice()
        .sort((a, b) => b.date - a.date)
        .slice(0, 7)
        .map(
          (s) =>
            `<div class="history-row"><span>${V.icon("bolt")}${new Date(s.date).toLocaleDateString("vi-VN")}</span><span>${s.words} từ</span><span>${s.correct}/${s.answers} câu đúng</span><span>${s.seed ? "Minh họa" : "Đã hoàn thành"}</span></div>`,
        )
        .join("")}</section>`
    );
  };
})(VOP);
