"use strict";
(function (V) {
  let dispose = () => {};
  let instance = 0;

  V.activity = (sessions, period = 7, smooth = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: period }, (_, i) => {
      const date = new Date(today.getTime() - (period - 1 - i) * 86400000);
      return {
        label: period === 7
          ? (date.getDay() === 0 ? "CN" : "T" + (date.getDay() + 1))
          : String(date.getDate()),
        date: date.toLocaleDateString("vi-VN"),
        total: sessions
          .filter((s) => s.date >= date.getTime() && s.date < date.getTime() + 86400000)
          .reduce((n, s) => n + s.answers, 0),
      };
    });
    const model = { days, smooth };
    const label = days.map((d) => `${d.date}: ${d.total} lượt trả lời`).join("; ");
    return `<div class="line-chart" role="img" aria-label="${V.escape(label)}" data-activity-chart="${V.escape(JSON.stringify(model))}"><svg aria-hidden="true" preserveAspectRatio="xMidYMid meet"></svg></div>`;
  };

  function geometry(days, smooth, width, height, gradientId) {
    const max = Math.max(4, Math.ceil(Math.max(...days.map((d) => d.total)) / 4) * 4);
    const left = Math.max(30, String(max).length * 7 + 12);
    const right = width - 14;
    const top = 12;
    const bottom = height - 28;
    const plotWidth = Math.max(1, right - left);
    const plotHeight = Math.max(1, bottom - top);
    const step = plotWidth / Math.max(1, days.length - 1);
    const x = (i) => left + i * step;
    const y = (value) => bottom - value / max * plotHeight;
    const ys = days.map((d) => y(d.total));
    const points = days.map((d, i) => `${x(i)},${ys[i]}`);
    let line = `M ${points.join(" L ")}`;
    if (smooth && days.length > 1) {
      // Monotone cubic segments never overshoot the actual values.
      const slopes = ys.slice(1).map((value, i) => (value - ys[i]) / step);
      const tangents = ys.map((_, i) => {
        if (i === 0) return slopes[0];
        if (i === ys.length - 1) return slopes[i - 1];
        const a = slopes[i - 1], b = slopes[i];
        return a * b > 0 ? 2 * a * b / (a + b) : 0;
      });
      line = `M ${points[0]}` + ys.slice(1).map((value, i) =>
        ` C ${x(i) + step / 3},${ys[i] + tangents[i] * step / 3} ${x(i + 1) - step / 3},${value - tangents[i + 1] * step / 3} ${x(i + 1)},${value}`
      ).join("");
    }
    // Thin crowded date ticks on narrow screens; retain every data point.
    const stride = Math.max(1, Math.ceil(30 / step));
    const ticks = days.map((_, i) => i).filter((i) => i % stride === 0);
    const last = days.length - 1;
    if (ticks.at(-1) !== last) {
      if ((last - ticks.at(-1)) * step < 25) ticks.pop();
      ticks.push(last);
    }
    return `<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${bottom}"><stop offset="0" stop-color="var(--accent)" stop-opacity=".14"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      ${[0, 1, 2, 3, 4].map((i) => `<line class="chart-gridline" x1="${left}" x2="${right}" y1="${y(max * i / 4)}" y2="${y(max * i / 4)}"/><text class="chart-axis chart-axis--y" x="${left - 10}" y="${y(max * i / 4) + 4}" text-anchor="end">${max * i / 4}</text>`).join("")}
      <path class="chart-area" d="${line} L ${right},${bottom} L ${left},${bottom} Z" fill="url(#${gradientId})"/>
      <path class="chart-stroke" d="${line}"/>
      ${days.map((d, i) => `<circle class="chart-dot" cx="${x(i)}" cy="${ys[i]}" r="4"><title>${d.total} lượt trả lời</title></circle>`).join("")}
      ${ticks.map((i) => `<text class="chart-axis chart-axis--x" x="${x(i)}" y="${height - 8}" text-anchor="middle">${V.escape(days[i].label)}</text>`).join("")}`;
  }

  V.mountActivityChart = (root) => {
    // A page/period change replaces the DOM. Disconnect the previous observer.
    dispose();
    dispose = () => {};
    const chart = root.querySelector("[data-activity-chart]");
    if (!chart) return;
    const { days, smooth } = JSON.parse(chart.dataset.activityChart);
    const svg = chart.querySelector("svg");
    const gradientId = `activity-fill-${++instance}`;
    let previous = "";
    function draw(width, height) {
      if (width <= 0 || height <= 0) return;
      const size = `${width.toFixed(2)} ${height.toFixed(2)}`;
      if (size === previous) return;
      previous = size;
      // One SVG user unit is one CSS pixel; labels and markers never stretch.
      svg.setAttribute("viewBox", `0 0 ${size}`);
      svg.innerHTML = geometry(days, smooth, width, height, gradientId);
    }
    const measure = () => draw(chart.clientWidth, chart.clientHeight);
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        draw(width, height);
      });
      observer.observe(chart);
      dispose = () => observer.disconnect();
    } else {
      window.addEventListener("resize", measure);
      dispose = () => window.removeEventListener("resize", measure);
    }
  };
})(VOP);
