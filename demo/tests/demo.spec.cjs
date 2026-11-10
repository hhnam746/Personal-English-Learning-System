const { test, expect } = require("@playwright/test");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const URL = pathToFileURL(path.resolve("index.html")).href;
async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(URL);
  await page.evaluate(() => document.fonts.ready);
  return errors;
}
async function route(page, id) {
  await page.locator(`.sidebar nav a[href="#${id}"]`).click();
}
async function fresh(page) {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}
test("file:// entry, vocabulary CRUD, safe text, validation and persisted theme", async ({
  page,
}) => {
  const errors = await open(page);
  await expect(page.locator("h1")).toContainText("hành trình");
  await expect(page.locator(".vocab-total strong")).toHaveText("48");
  await page.locator('.top-actions [data-action="add"]').click();
  await page.locator('[name="word"]').fill("resilient");
  await page.locator('[name="meaning"]').fill("kiên cường");
  await page.locator('#word-form button[type="submit"]').click();
  await expect(page.locator("#form-error")).toContainText("đã có");
  await page.locator('[name="word"]').fill("a fresh start");
  await page.locator('[name="meaning"]').fill("một khởi đầu mới");
  await page.locator('[name="ipa"]').fill("/ə freʃ stɑːrt/");
  await page.locator('[name="example"]').fill("Tomorrow is a fresh start.");
  await page.locator('#word-form button[type="submit"]').click();
  await expect(page.locator(".vocab-total strong")).toHaveText("49");
  await expect(page.locator("#toast")).toContainText("phiên sau");
  await expect(page.locator("h1")).toContainText("hành trình");
  await route(page, "library");
  await page.locator("#word-search").fill("a fresh start");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody .level-tag")).toContainText("Chưa học");
  await page
    .getByRole("button", { name: "Sửa a fresh start", exact: true })
    .click();
  await page.locator('[name="meaning"]').fill("<b>khởi đầu</b>");
  await page.locator('#word-form button[type="submit"]').click();
  await expect(page.locator(".meaning-cell")).toHaveText("<b>khởi đầu</b>");
  await expect(page.locator(".meaning-cell b")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(49);
  await page.locator("#word-search").fill("a fresh start");
  await expect(page.locator("tbody .meaning-cell")).toHaveText(
    "<b>khởi đầu</b>",
  );
  await page
    .getByRole("button", { name: "Xóa a fresh start", exact: true })
    .click();
  await page.getByRole("button", { name: "Giữ lại từ" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Xóa a fresh start", exact: true })
    .click();
  await page.getByRole("button", { name: "Xóa từ này" }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.locator('.sidebar [data-action="theme"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});
test("complete all four exercise types, deliberate error, repair, results and persisted SRS", async ({
  page,
}) => {
  const errors = await open(page);
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-action="begin"]').click();
  await expect(page.locator("h1")).toContainText("Từ mới trong phiên");
  await page.locator('[data-action="questions"]').click();
  const seen = new Set();
  let step = 0,
    wrongWord = null;
  while (await page.locator("#question-form").count()) {
    const type = await page.locator(".exercise-label span").innerText();
    seen.add(type);
    let w = await page.evaluate(() => {
      const b = document.querySelector('[data-action="session-speak"]');
      if (b) return VOP.state.words.find((w) => w.id === b.dataset.id);
      const hint = document.querySelector(".context-hint");
      return VOP.state.words.find(
        (w) => hint.textContent === "Gợi ý nghĩa: " + w.meaning,
      );
    });
    let expected =
      (await page.locator(".answer-options").count()) &&
      !(await page.locator(".audio-button").count())
        ? w.meaning
        : w.word;
    const options = page.locator(".answer-option");
    if (await options.count()) {
      if (step === 0) {
        wrongWord = w.id;
        await options.filter({ hasNotText: w.meaning }).first().click();
      } else {
        const correct = options.filter({ hasText: expected });
        await correct.click();
      }
      // Clicking an answer focuses Check; Enter checks the chosen answer.
      await page.keyboard.press("Enter");
    } else {
      await page.locator("#typed-answer").fill(expected);
      await page.keyboard.press("Enter");
    }
    await expect(page.locator(".feedback-copy")).toBeVisible();
    await page.locator('[data-action="next"]').click();
    if (++step > 40) throw Error("unbounded session");
  }
  expect([...seen]).toEqual(
    expect.arrayContaining([
      "CHỌN NGHĨA",
      "NGHE VÀ CHỌN",
      "NGHE VÀ GÕ",
      "ĐIỀN TỪ",
      "LƯỢT CỦNG CỐ",
    ]),
  );
  await expect(page.locator(".result-page h1")).toContainText(
    "Hoàn thành phiên luyện tập",
  );
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("vop-demo-v1")),
  );
  expect(saved.sessions.length).toBe(8);
  expect(saved.words.find((w) => w.id === wrongWord).level).toBe(1);
  expect(saved.words.filter((w) => w.level === 0).length).toBe(4);
  expect(saved.sessions.at(-1).answers).toBe(step);
  expect(saved.sessions.at(-1).correct).toBe(step - 1);
  await page.reload();
  await route(page, "progress");
  await expect(page.locator(".history-row").first()).toContainText(
    "Đã hoàn thành",
  );
  expect(errors).toEqual([]);
});
test("flashcard flip, self assessment and independent levels", async ({
  page,
}) => {
  await open(page);
  const before = await page.evaluate(() => JSON.stringify(VOP.state.words));
  await route(page, "flashcards");
  await page.locator('[data-action="flip"]').click();
  await expect(page.locator(".flashcard")).toHaveClass(/flipped/);
  await page.locator('[data-action="flash-rate"][data-value="yes"]').click();
  await expect(page.locator(".flash-top")).toContainText("02");
  expect(await page.evaluate(() => JSON.stringify(VOP.state.words))).toBe(
    before,
  );
  await page.locator("#flash-filter").selectOption("1");
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-action="flip"]').click();
    await page.locator('[data-action="flash-rate"][data-value="no"]').click();
  }
  await expect(page.locator(".result-page h1")).toContainText("bộ thẻ");
  await expect(page.locator(".result-metrics")).toContainText("4");
  await page.locator('[data-action="flash-restart"]').click();
  await expect(page.locator(".flash-top")).toContainText("01");
});
test("due navigation, global search, empty state and keyboard modal trap", async ({
  page,
}) => {
  await open(page);
  await page.locator('.upcoming-panel [data-action="filter-due"]').click();
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await page.locator("#word-search").fill("no-word-exists");
  await expect(page.locator(".empty-state")).toContainText("Không tìm thấy");
  await page.locator('[data-action="clear-filters"]').click();
  await expect(page.locator("tbody tr")).toHaveCount(48);
  await page.locator("#global-search").fill("serendipity");
  await page.locator("#global-search").press("Enter");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.locator('.top-actions [data-action="add"]').click();
  await expect(page.locator('[name="word"]')).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator('[data-action="close-modal"]')).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator('#word-form button[type="submit"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".modal")).toHaveCount(0);
});
test("audio fallback and quit confirmation preserve progress", async ({
  page,
}) => {
  await open(page);
  const before = await page.evaluate(() => JSON.stringify(VOP.state.words));
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-action="begin"]').click();
  await page.locator('[data-action="questions"]').click();
  await page.locator(".answer-option").first().click();
  await page.locator("#check-answer").click();
  await page.locator('[data-action="next"]').click();
  await expect(page.locator('[data-action="audio-fallback"]')).toBeVisible();
  await page.locator('[data-action="audio-fallback"]').click();
  await expect(page.locator(".exercise-label")).toContainText("CHỌN NGHĨA");
  await route(page, "dashboard");
  await expect(page.locator(".modal h2")).toContainText("Dừng phiên");
  await page.getByRole("button", { name: "Tiếp tục học", exact: true }).click();
  await expect(page.locator("#question-form")).toBeVisible();
  await route(page, "dashboard");
  await page.locator("#confirm-quit").click();
  await expect(page.locator(".vocab-total")).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(VOP.state.words))).toBe(
    before,
  );
});
test("all screens, themes, responsive widths and local assets have no overflow", async ({
  page,
}) => {
  const errors = await open(page);
  for (const width of [1672, 1440, 1024, 820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1672 ? 940 : 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => {
        VOP.state.theme = t;
        document.documentElement.dataset.theme = t;
      }, theme);
      for (const id of [
        "dashboard",
        "library",
        "practice",
        "flashcards",
        "progress",
      ]) {
        await page.evaluate((id) => (location.hash = id), id);
        await expect(page.locator("main h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${id} ${theme} ${width}px overflow`,
        ).toBe(true);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
    location.hash = "dashboard";
  });
  await page.screenshot({ path: "/tmp/vop-mobile.png", fullPage: true });
  const missing = await page.evaluate(() =>
    [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.src),
  );
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test("shared primary buttons keep the same glass material across screens and dialogs", async ({ page }) => {
  await open(page);
  const keys = ["color", "backgroundImage", "fontFamily", "fontSize", "fontWeight", "lineHeight", "borderRadius", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "boxShadow", "minHeight"];
  for (const theme of ["light", "dark"]) {
    await page.evaluate(t => {
      VOP.state.theme = t;
      document.documentElement.dataset.theme = t;
    }, theme);
    let reference;
    for (const screen of ["dashboard", "library", "practice", "flashcards", "progress"]) {
      await route(page, screen);
      const styles = await page.locator(".btn-primary").evaluateAll((buttons, keys) => buttons.map(button => {
        const s = getComputedStyle(button);
        return Object.fromEntries(keys.map(k => [k, s[k]]));
      }), keys);
      reference ??= styles[0];
      styles.forEach(style => expect(style).toEqual(reference));
    }
    expect(reference.backgroundImage).toContain("linear-gradient");
    expect(reference.color.match(/\d+/g).map(Number).every(n => n > 200)).toBe(true);
    await page.locator('.top-actions [data-action="add"]').click();
    const formStyle = await page.locator("#word-form .btn-primary").evaluate((button, keys) => {
      const s = getComputedStyle(button);
      return Object.fromEntries(keys.map(k => [k, s[k]]));
    }, keys);
    expect(formStyle).toEqual(reference);
    await page.keyboard.press("Escape");
  }
});

test("organic glass clips the material but preserves crisp HTML and working controls", async ({
  page,
}) => {
  const errors = await open(page);
  for (const width of [1672, 1440, 1024, 820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 940 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => {
        VOP.state.theme = t;
        document.documentElement.dataset.theme = t;
      }, theme);
      const properties = await page
        .locator(".organic-blob")
        .evaluateAll((blobs) =>
          blobs.map((blob) => {
            const glass = blob.querySelector(".organic-blob__glass"),
              content = blob.querySelector(".organic-blob__content");
            const clipId =
              glass.style.clipPath || getComputedStyle(glass).clipPath;
            const id = clipId.match(/#([^"\)]+)/)?.[1];
            const clip = document.getElementById(id);
            const outline = blob.querySelector(".organic-blob__outline");
            return {
              variant: blob.dataset.blobVariant,
              radius: getComputedStyle(blob).borderRadius,
              clip: !!clip,
              units: clip?.getAttribute("clipPathUnits"),
              samePath:
                clip?.querySelector("path").getAttribute("d") ===
                outline.getAttribute("d"),
              backdrop: getComputedStyle(glass).backdropFilter,
              filter: getComputedStyle(content).filter,
              transform: getComputedStyle(content).transform,
              animation: getComputedStyle(glass).animationName,
            };
          }),
        );
      expect(properties.map((p) => p.variant)).toEqual(["summary", "accuracy", "brain"]);
      for (const p of properties) {
        expect(p.radius).toBe("0px");
        expect(p.clip).toBe(true);
        expect(p.units).toBe("objectBoundingBox");
        expect(p.samePath).toBe(true);
        expect(p.backdrop).toContain("blur(8px)");
        expect(p.filter).toBe("none");
        expect(p.transform).toBe("none");
        expect(p.animation).toBe("none");
      }
      const contentEscapes = await page
        .locator(".organic-blob--summary")
        .evaluate((blob) => {
          const r = blob.getBoundingClientRect(),
            outline = blob.querySelector(".organic-blob__outline");
          return [
            ...blob.querySelectorAll(
              "h2,.vocab-total strong,.meter,.vocab-breakdown",
            ),
          ]
            .filter((el) => {
              let b = el.getBoundingClientRect();
              // Headings occupy a full row; check rendered glyph bounds, not empty row space.
              if (el.matches("h2,.vocab-total strong")) {
                const range = document.createRange();
                range.selectNodeContents(el);
                b = range.getBoundingClientRect();
              }
              return [
                [b.left, b.top],
                [b.right, b.top],
                [b.right, b.bottom],
                [b.left, b.bottom],
              ].some(
                ([x, y]) =>
                  !outline.isPointInFill(
                    new DOMPoint(
                      (x - r.left) / r.width,
                      (y - r.top) / r.height,
                    ),
                  ),
              );
            })
            .map((el) => el.className || el.tagName);
        });
      expect(
        contentEscapes,
        `${width}px ${theme}: content outside blob`,
      ).toEqual([]);
      const overlap = await page
        .locator(".accuracy-panel")
        .evaluate((panel) => {
          const brain = panel
            .querySelector(".organic-blob--brain")
            .getBoundingClientRect();
          const content = panel.querySelector(":scope>.organic-blob__content") || panel;
          return [
            ...content.querySelectorAll(
              ":scope>h2,:scope>.accuracy-total,:scope>p,:scope>.meter",
            ),
          ].some((el) => {
            let r = el.getBoundingClientRect();
            if (el.matches("h2,.accuracy-total,p")) {
              const range = document.createRange();
              range.selectNodeContents(el);
              r = range.getBoundingClientRect();
            }
            // Check the visible silhouette, rather than empty corners of its bounding box.
            const outline = panel.querySelector(".organic-blob--brain .organic-blob__outline");
            const left = Math.max(r.left, brain.left), right = Math.min(r.right, brain.right);
            const top = Math.max(r.top, brain.top), bottom = Math.min(r.bottom, brain.bottom);
            for (let x = left; x <= right; x += 2) {
              for (let y = top; y <= bottom; y += 2) {
                if (outline.isPointInFill(new DOMPoint((x-brain.left)/brain.width, (y-brain.top)/brain.height))) return true;
              }
            }
            return false;
          });
        });
      expect(overlap, `${width}px ${theme}: brain overlaps data`).toBe(false);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.organic-blob--summary [data-action="level"]').click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await route(page, "dashboard");
  await page.locator("#activity-period").selectOption("14");
  const ids = await page
    .locator("[id]")
    .evaluateAll((els) => els.map((e) => e.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(
    page.locator(".organic-blob--brain svg.brain-illustration"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});


test("responsive dialogs and study states remain usable with the shared glass surfaces", async ({ page }) => {
  const errors = await open(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const fits = async (locator) => expect(await locator.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  for (const width of [1440, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(t => { VOP.state.theme = t; document.documentElement.dataset.theme = t; location.hash = "library"; }, theme);
      await expect(page.locator("main h1")).toHaveText("Kho từ vựng");
      await page.locator('.top-actions [data-action="add"]').click();
      const modal = page.getByRole("dialog");
      await fits(modal);
      await expect(page.locator('[name="word"]')).toBeFocused();
      await page.locator('[name="word"]').fill("glass review");
      await page.locator('[name="meaning"]').fill("kiểm tra giao diện kính");
      await page.locator('#word-form .btn-primary').scrollIntoViewIfNeeded();
      await expect(page.locator('#word-form .btn-primary')).toBeInViewport();
      await fits(page.locator('#word-form .btn-primary'));
      await page.keyboard.press("Escape");
      await page.locator('tbody [data-action="detail"]').first().click();
      await fits(page.getByRole("dialog"));
      await page.keyboard.press("Escape");
      await page.evaluate(() => location.hash = "flashcards");
      await expect(page.locator("main h1")).toHaveText("Flashcard");
      if (!(await page.locator('.flashcard').evaluate(el => el.classList.contains('flipped')))) {
        await page.locator('[data-action="flip"]').click();
      }
      await expect(page.locator('.flashcard')).toHaveClass(/flipped/);
      await expect(page.locator('.flash-back strong')).toBeVisible();
      await fits(page.locator('.flash-back'));
      await page.evaluate(() => location.hash = "practice");
      await expect(page.locator("main h1")).toHaveText("Luyện tập");
      await fits(page.locator('.session-intro .btn-primary'));
      await page.locator('[data-action="begin"]').click();
      await expect(page.locator('.new-word-intro')).toBeVisible();
      await page.locator('[data-action="questions"]').click();
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await expect(page.locator('.learning-header')).toBeInViewport();
      await fits(page.locator('#question-form'));
      await page.locator('[data-action="answer"]').first().click();
      await page.locator('#check-answer').click();
      await expect(page.locator('.feedback-copy')).toBeVisible();
      if (width < 768) {
        const button = await page.locator('[data-action="next"]').boundingBox();
        const nav = await page.locator('.mobile-nav').boundingBox();
        expect(button.y + button.height).toBeLessThanOrEqual(nav.y - 4);
      }
      await fits(page.locator('#question-form'));
      await page.locator('[data-action="quit"]').click();
      await fits(page.getByRole("dialog"));
      await page.locator('#confirm-quit').click();
    }
  }
  expect(errors).toEqual([]);
});
