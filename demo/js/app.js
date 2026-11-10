"use strict";
(function (V) {
  const KEY = "vop-demo-v1",
    app = document.getElementById("app"),
    modalRoot = document.getElementById("modal-root");
  let view = "dashboard",
    search = "",
    filter = "",
    sort = "recent",
    period = 7,
    session = null,
    stage = "setup",
    answer = "",
    feedback = null,
    result = null;
  let flash = {
    index: 0,
    filter: "",
    flipped: false,
    ratings: {},
    done: false,
  };
  let modalFocus = null,
    toastTimer,
    storageWarning = "";
  const e = V.escape;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return V.seed();
      const s = JSON.parse(raw);
      if (
        s.version !== 1 ||
        !Array.isArray(s.words) ||
        !Array.isArray(s.sessions)
      )
        throw Error("schema");
      if (
        !s.words.every(
          (w) =>
            typeof w.id === "string" &&
            typeof w.word === "string" &&
            typeof w.meaning === "string" &&
            Number.isInteger(w.level) &&
            w.level >= 0 &&
            w.level <= 5 &&
            (w.level === 0 || Number.isFinite(w.due)) &&
            Number.isFinite(w.created),
        )
      )
        throw Error("word");
      if (new Set(s.words.map((w) => w.id)).size !== s.words.length)
        throw Error("duplicate IDs");
      if (
        !s.sessions.every(
          (x) =>
            Number.isFinite(x.date) &&
            Number.isFinite(x.answers) &&
            Number.isFinite(x.correct),
        )
      )
        throw Error("history");
      return { ...s, theme: s.theme === "light" ? "light" : "dark" };
    } catch (err) {
      storageWarning =
        "Dữ liệu lưu không đọc được. Đang hiển thị bộ từ minh họa trong phiên này.";
      return V.seed();
    }
  }
  V.state = load();
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(V.state));
      return true;
    } catch (err) {
      toast(
        "Trình duyệt không cho lưu dữ liệu. Thay đổi chỉ được giữ trong phiên đang mở.",
        true,
      );
      return false;
    }
  }
  function toast(text, error = false) {
    const el = document.getElementById("toast");
    el.textContent = text;
    el.className = "toast visible" + (error ? " error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
  }
  function setTheme() {
    document.documentElement.dataset.theme = V.state.theme;
    document.querySelector('meta[name="theme-color"]').content =
      V.state.theme === "dark" ? "#1a191b" : "#e5dce0";
  }
  setTheme();
  function render(focus = false) {
    app.dataset.view = view;
    document.body.dataset.view = view;
    let content;
    if (view === "dashboard") content = V.dashboard(V.state, period);
    else if (view === "library")
      content = V.library(V.state, filter, search, sort);
    else if (view === "practice")
      content =
        stage === "intro"
          ? V.introduction(session)
          : stage === "questions"
            ? V.question(session, answer, feedback)
            : stage === "results"
              ? V.results(result)
              : V.practiceSetup(V.state);
    else if (view === "flashcards")
      content = flash.done
        ? V.flashResult(flash)
        : V.flashcards(V.state, flash);
    else content = V.progress(V.state);
    app.innerHTML = V.shell(view, content);
    V.mountActivityChart(app);
    document.title = "VOP — " + V.nav.find((n) => n[0] === view)[2];
    if (focus) document.getElementById("main").focus({ preventScroll: true });
    if (view === "practice" && stage === "questions" && !feedback)
      document.getElementById("typed-answer")?.focus({ preventScroll: true });
  }
  function navigate(next, force = false) {
    if (!V.nav.some((n) => n[0] === next)) next = "dashboard";
    if (
      session &&
      ["intro", "questions"].includes(stage) &&
      next !== view &&
      !force
    ) {
      askQuit(() => navigate(next, true));
      return;
    }
    if (next !== view) {
      if (view === "practice") {
        session = null;
        stage = "setup";
      }
      view = next;
      window.scrollTo(0, 0);
    }
    if (location.hash !== "#" + next)
      history.replaceState(null, "", "#" + next);
    closeModal();
    render(true);
  }
  function openModal(html, onReady) {
    modalFocus = document.activeElement;
    modalRoot.innerHTML = `<div class="modal-overlay"><div class="modal glass-panel glass-panel--dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">${html}</div></div>`;
    document.body.classList.add("modal-open");
    const focus =
      modalRoot.querySelector("[autofocus]") ||
      modalRoot.querySelector("button,input,select,textarea") ||
      modalRoot.querySelector(".modal");
    focus.focus();
    onReady?.();
  }
  function closeModal() {
    if (!modalRoot.children.length) return;
    modalRoot.innerHTML = "";
    document.body.classList.remove("modal-open");
    modalFocus?.isConnected && modalFocus.focus();
  }
  const modalHeader = (title) =>
    `<div class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-button" data-action="close-modal" aria-label="Đóng hộp thoại">${V.icon("close")}</button></div>`;
  function wordForm(id) {
    const w = V.state.words.find((w) => w.id === id) || {
      word: "",
      meaning: "",
      ipa: "",
      example: "",
      pos: "",
    };
    openModal(
      `${modalHeader(id ? "Chỉnh sửa từ vựng" : "Lưu một từ mới.")}<p class="modal-description">${id ? "Cập nhật nội dung, giữ lại tiến độ ghi nhớ." : "Nhập từ tiếng Anh và nghĩa tiếng Việt."}</p><form id="word-form" data-id="${e(id || "")}"><label>Từ / Cụm từ tiếng Anh <span class="required">*</span><input class="glass-control" autofocus name="word" value="${e(w.word)}" maxlength="80" required placeholder="Ví dụ: resilient" autocomplete="off"></label><label>Nghĩa tiếng Việt <span class="required">*</span><input class="glass-control" name="meaning" value="${e(w.meaning)}" maxlength="300" required placeholder="Ví dụ: kiên cường; có khả năng phục hồi"></label><div class="form-pair"><label>Phiên âm IPA<input class="glass-control" name="ipa" value="${e(w.ipa)}" maxlength="160" placeholder="/rɪˈzɪliənt/"></label><label>Từ loại<select class="glass-control" name="pos"><option value="">Không bắt buộc</option>${["noun", "verb", "adjective", "adverb", "phrase", "other"].map((p) => `<option value="${p}" ${w.pos === p ? "selected" : ""}>${{ noun: "Danh từ", verb: "Động từ", adjective: "Tính từ", adverb: "Trạng từ", phrase: "Cụm từ", other: "Khác" }[p]}</option>`).join("")}</select></label></div><label>Câu ví dụ tiếng Anh<textarea class="glass-control" name="example" maxlength="500" rows="2" placeholder="She remained resilient in the face of change.">${e(w.example)}</textarea></label><p class="field-help">Dùng nguyên từ đã lưu trong câu để có thể luyện điền từ. Phát âm sử dụng giọng đọc trình duyệt.</p><p id="form-error" class="form-error" role="alert"></p><div class="form-bottom"><span>${V.icon("book")} ${id ? "Tiến độ được giữ nguyên" : "Từ được lưu ở trạng thái Chưa học"}</span><button class="btn btn-primary" type="submit">${id ? "Lưu thay đổi" : "Lưu từ mới"}<span class="btn-icon">${V.icon("check")}</span></button></div></form>`,
    );
  }
  function detail(id) {
    const w = V.state.words.find((w) => w.id === id);
    if (!w) return;
    openModal(
      `${modalHeader("Chi tiết từ vựng")}<div class="detail-word"><h3>${e(w.word)}</h3><button class="icon-button" data-action="speak" data-id="${e(w.id)}" aria-label="Phát âm">${V.icon("sound")}</button></div><div class="detail-meta"><span>${e(w.ipa)}</span><span>${e(w.pos)}</span>${V.level(w.level)}</div><p class="detail-meaning">${e(w.meaning)}</p><div class="detail-example glass-inset"><span class="eyebrow">TRONG NGỮ CẢNH</span><p>${e(w.example) || "Chưa có câu ví dụ. Bạn có thể bổ sung khi chỉnh sửa từ."}</p></div><div class="detail-schedule">${V.icon("clock")}<span>${V.dueText(w)}</span></div><div class="modal-actions">${V.button("Chỉnh sửa từ", "edit", false, "edit", `data-id="${e(w.id)}"`)}<button class="text-link danger-hover" data-action="delete" data-id="${e(w.id)}">Xóa từ</button></div>`,
    );
  }
  function deleteWord(id) {
    const w = V.state.words.find((w) => w.id === id);
    if (!w) return;
    openModal(
      `${modalHeader("Xóa từ khỏi kho?")}<p class="modal-description">Từ <strong>${e(w.word)}</strong> và tiến độ ghi nhớ của từ này sẽ bị xóa khỏi bản demo trên thiết bị.</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Giữ lại từ</button><button class="btn btn-danger" data-action="confirm-delete" data-id="${e(id)}">Xóa từ này</button></div>`,
    );
  }
  function about() {
    openModal(
      `${modalHeader("Không gian demo VOP")}<div class="about-content"><p>Bản demo HTML, CSS và JavaScript thuần. Không tài khoản, máy chủ hay cơ sở dữ liệu.</p><h3>Dữ liệu trên thiết bị</h3><p>48 từ và 7 phiên ban đầu là dữ liệu minh họa. Từ bạn thêm và kết quả luyện tập được lưu bằng localStorage của trình duyệt hiện tại.</p><h3>Mặc định đang thử nghiệm</h3><ul><li>Ưu tiên từ đến hạn, tối đa 12 từ khác nhau; gợi ý 8 từ cũ và 4 từ mới khi đủ dữ liệu.</li><li>Từ mới cần hai lượt đúng có kiểm tra nghĩa/ngữ cảnh; từ cũ chỉ tăng tối đa một cấp khi ôn đến hạn hợp lệ.</li><li>Sai giảm một cấp (tối thiểu L1); lượt củng cố không giúp tăng lại ngay.</li><li>Lịch ôn: 10 phút, 6 giờ, 1 ngày, 3 ngày, 7 ngày. L5 duy trì sau 7 ngày, rồi 14 ngày.</li><li>Flashcard không thay đổi Level. Phát âm phụ thuộc giọng đọc được cài trên trình duyệt.</li></ul><p>Các thông số này là <strong>đề xuất chưa chốt</strong> trong brief v0.1, không phải thuật toán đánh giá trí nhớ đã kiểm chứng.</p><p>Mở file trực tiếp có thể có chính sách lưu trữ khác nhau theo trình duyệt. Demo sẽ báo nếu không thể lưu.</p></div><button class="btn btn-secondary" data-action="close-modal">Đã hiểu</button>`,
    );
  }
  function start() {
    if (session && ["intro", "questions"].includes(stage)) {
      navigate("practice");
      return;
    }
    navigate("practice");
    stage = "setup";
    render();
  }
  function begin() {
    if (!V.selectWords(V.state.words).length) {
      toast(
        "Chưa có từ đến hạn hoặc từ mới. Bạn có thể ôn tự do bằng Flashcard.",
      );
      return;
    }
    session = V.createSession(V.state.words, "speechSynthesis" in window);
    stage = session.selected.some((w) => !w.level) ? "intro" : "questions";
    answer = "";
    feedback = null;
    renderLearningStage();
  }
  function renderLearningStage() {
    render(true);
    // A new stage/question starts at its heading, even after a long mobile introduction.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
  function checkAnswer() {
    if (feedback || !session || stage !== "questions") return;
    const input = document.getElementById("typed-answer");
    if (input) answer = input.value;
    if (!answer.trim()) return;
    feedback = V.recordAnswer(session, answer);
    render();
    const next = document.querySelector('[data-action="next"]');
    next?.focus({ preventScroll: true });
    next?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }
  function nextQuestion() {
    if (!feedback) return;
    session.index++;
    answer = "";
    feedback = null;
    if (session.index >= session.queue.length) {
      result = V.finishSession(V.state.words, session);
      V.state.words = result.words;
      if (!V.state.sessions.some((s) => s.id === result.summary.id)) {
        V.state.sessions.push(result.summary);
        persist();
      }
      stage = "results";
      session = null;
    }
    renderLearningStage();
  }
  function askQuit(continuation) {
    openModal(
      `${modalHeader("Dừng phiên luyện tập?")}<p class="modal-description">Phiên này chưa hoàn tất. Câu trả lời trong phiên sẽ không được ghi vào tiến độ.</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Tiếp tục học</button><button class="btn btn-danger" id="confirm-quit">Dừng phiên</button></div>`,
      () =>
        document.getElementById("confirm-quit").addEventListener(
          "click",
          () => {
            session = null;
            stage = "setup";
            answer = "";
            feedback = null;
            closeModal();
            continuation ? continuation() : render(true);
          },
          { once: true },
        ),
    );
  }
  function speak(id, inSession = false) {
    const w = (inSession ? session?.selected : V.state.words)?.find(
      (w) => w.id === id,
    );
    if (!w) return;
    if (!("speechSynthesis" in window)) {
      toast("Thiết bị chưa hỗ trợ giọng đọc. Hãy dùng bài chọn nghĩa.", true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(w.word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled")
        toast(
          "Không phát được âm thanh. Dùng tùy chọn chuyển sang chọn nghĩa nếu đang luyện tập.",
          true,
        );
    };
    window.speechSynthesis.speak(utterance);
  }
  function flashWords() {
    return V.state.words.filter(
      (w) => flash.filter === "" || String(w.level) === flash.filter,
    );
  }
  function flashMove(delta, rate) {
    const words = flashWords();
    if (!words.length) return;
    if (rate !== undefined) flash.ratings[words[flash.index].id] = rate;
    if (flash.index + delta >= words.length) {
      flash.done = true;
    } else {
      flash.index = Math.max(0, flash.index + delta);
      flash.flipped = false;
    }
    render();
  }
  function action(el) {
    const { action: a, id } = el.dataset;
    if (a === "add") wordForm();
    else if (a === "edit") wordForm(id);
    else if (a === "detail") detail(id);
    else if (a === "delete") deleteWord(id);
    else if (a === "confirm-delete") {
      V.state.words = V.state.words.filter((w) => w.id !== id);
      const ok = persist();
      closeModal();
      flash.index = 0;
      render();
      if (ok) toast("Đã xóa từ khỏi kho.");
    } else if (a === "close-modal") closeModal();
    else if (a === "about") about();
    else if (a === "theme") {
      V.state.theme = V.state.theme === "dark" ? "light" : "dark";
      setTheme();
      persist();
    } else if (a === "speak") speak(id);
    else if (a === "session-speak") speak(id, true);
    else if (a === "start") start();
    else if (a === "begin") begin();
    else if (a === "questions") {
      stage = "questions";
      renderLearningStage();
    } else if (a === "quit") askQuit();
    else if (a === "answer" && !feedback) {
      answer = el.dataset.answer;
      render();
      document.getElementById("check-answer")?.focus({ preventScroll: true });
    } else if (a === "next") nextQuestion();
    else if (a === "dashboard") navigate("dashboard");
    else if (a === "audio-fallback") {
      if (feedback) return;
      session.queue[session.index].type = "meaning";
      answer = "";
      render();
      toast("Đã chuyển sang chọn nghĩa.");
    } else if (a === "filter-due") {
      filter = "due";
      search = "";
      navigate("library");
    } else if (a === "filter") {
      filter = el.dataset.filter;
      render();
    } else if (a === "level") {
      filter = el.dataset.level;
      search = "";
      navigate("library");
    } else if (a === "clear-filters") {
      filter = "";
      search = "";
      render();
    } else if (a === "flip") {
      flash.flipped = !flash.flipped;
      render();
      document
        .querySelector('[data-action="flip"]')
        ?.focus({ preventScroll: true });
    } else if (a === "flash-rate") flashMove(1, el.dataset.value === "yes");
    else if (a === "flash-next") flashMove(1);
    else if (a === "flash-prev") flashMove(-1);
    else if (a === "flash-restart") {
      flash = { ...flash, index: 0, flipped: false, ratings: {}, done: false };
      render();
    }
  }
  document.addEventListener("click", (event) => {
    const nav = event.target.closest('a[href^="#"]');
    if (nav && V.nav.some((n) => n[0] === nav.hash.slice(1))) {
      event.preventDefault();
      navigate(nav.hash.slice(1));
      return;
    }
    const el = event.target.closest("[data-action]");
    if (el && !el.disabled) {
      event.preventDefault();
      action(el);
    } else if (event.target.classList.contains("modal-overlay")) closeModal();
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id === "question-form") {
      event.preventDefault();
      if (feedback) nextQuestion();
      else checkAnswer();
    }
    if (event.target.id !== "word-form") return;
    event.preventDefault();
    const form = event.target,
      values = Object.fromEntries(new FormData(form));
    Object.keys(values).forEach((k) => (values[k] = values[k].trim()));
    const id = form.dataset.id,
      error = V.validateWord(values, V.state.words, id);
    if (error) {
      document.getElementById("form-error").textContent = error;
      return;
    }
    if (id)
      V.state.words = V.state.words.map((w) =>
        w.id === id ? { ...w, ...values } : w,
      );
    else
      V.state.words.unshift({
        ...values,
        id: "word-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        level: 0,
        due: null,
        created: Date.now(),
        lapses: 0,
        maintenance: 0,
      });
    const ok = persist();
    closeModal();
    render();
    if (ok)
      toast(
        id
          ? "Đã lưu thay đổi."
          : "Đã lưu từ mới. Bạn có thể học trong phiên sau.",
      );
  });
  document.addEventListener("input", (event) => {
    if (event.target.id === "word-search") {
      search = event.target.value;
      const matches = V.state.words.filter(
        (w) =>
          (filter === "" ||
            String(w.level) === filter ||
            (filter === "due" && w.level > 0 && w.due <= Date.now())) &&
          V.normal(w.word + " " + w.meaning).includes(V.normal(search)),
      );
      matches.sort(
        sort === "alpha"
          ? (a, b) => a.word.localeCompare(b.word)
          : sort === "level"
            ? (a, b) => a.level - b.level
            : (a, b) => b.created - a.created,
      );
      document.getElementById("library-results").innerHTML = V.wordTable(
        matches,
        V.state.words.length,
      );
    }
    if (event.target.id === "typed-answer") {
      answer = event.target.value;
      document.getElementById("check-answer").disabled = !answer.trim();
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.id === "activity-period") {
      period = +event.target.value;
      render();
    }
    if (event.target.id === "word-sort") {
      sort = event.target.value;
      render();
    }
    if (event.target.id === "flash-filter") {
      flash = {
        index: 0,
        filter: event.target.value,
        flipped: false,
        ratings: {},
        done: false,
      };
      render();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (modalRoot.children.length) {
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        const items = [
          ...modalRoot.querySelectorAll(
            "button:not([disabled]),input,textarea,select,[href]",
          ),
        ];
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.target.id === "global-search" && event.key === "Enter") {
      event.preventDefault();
      search = event.target.value;
      filter = "";
      navigate("library");
      return;
    }
    if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
    if (event.key === "/") {
      event.preventDefault();
      (
        document.getElementById("word-search") ||
        document.getElementById("global-search")
      )?.focus();
    }
    if (
      view === "practice" &&
      stage === "questions" &&
      !feedback &&
      /^[1-4]$/.test(event.key)
    ) {
      const btn = document.querySelectorAll('[data-action="answer"]')[
        +event.key - 1
      ];
      if (btn) {
        event.preventDefault();
        action(btn);
      }
    }
    if (
      view === "practice" &&
      stage === "questions" &&
      event.key === "Enter" &&
      !event.target.closest("button")
    ) {
      event.preventDefault();
      feedback ? nextQuestion() : checkAnswer();
    }
    if (
      view === "flashcards" &&
      !flash.done &&
      event.key === " " &&
      !event.target.closest("button")
    ) {
      event.preventDefault();
      flash.flipped = !flash.flipped;
      render();
    }
    if (view === "flashcards" && event.key === "ArrowRight") flashMove(1);
    if (view === "flashcards" && event.key === "ArrowLeft") flashMove(-1);
  });
  window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
  window.addEventListener("beforeunload", (event) => {
    if (session && ["intro", "questions"].includes(stage)) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  // A second tab must not silently overwrite an active learning session.
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      toast(
        "Dữ liệu đã thay đổi ở tab khác. Tải lại trang để đồng bộ trước khi chỉnh sửa tiếp.",
        true,
      );
    }
  });
  view = V.nav.some((n) => n[0] === location.hash.slice(1))
    ? location.hash.slice(1)
    : "dashboard";
  render();
  if (storageWarning) toast(storageWarning, true);
})(VOP);
