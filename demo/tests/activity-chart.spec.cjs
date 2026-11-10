const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const url = pathToFileURL(path.resolve('index.html')).href;

async function sizeSettled(page) {
  await expect.poll(() => page.locator('.line-chart').evaluate(chart => {
    const box = chart.getBoundingClientRect(), view = chart.querySelector('svg').viewBox.baseVal;
    return Math.max(Math.abs(view.width - box.width), Math.abs(view.height - box.height));
  })).toBeLessThan(.1);
}
async function inspect(page) {
  return page.locator('.dashboard-activity').evaluate(panel => {
    const chart = panel.querySelector('.line-chart'), svg = chart.querySelector('svg');
    const rect = chart.getBoundingClientRect(), header = panel.querySelector('.panel-top').getBoundingClientRect();
    const grid = [...svg.querySelectorAll('.chart-gridline')].map(el => Number(el.getAttribute('y1')));
    const boxes = [...svg.querySelectorAll('text,circle')].map(el => el.getBoundingClientRect());
    const labels = [...svg.querySelectorAll('.chart-axis--x')].map(el => el.getBoundingClientRect());
    const marker = svg.querySelector('circle').getBoundingClientRect();
    return {
      height: rect.height,
      plotHeight: Math.max(...grid) - Math.min(...grid),
      fontHeight: svg.querySelector('.chart-axis--y').getBoundingClientRect().height,
      markerWidth: marker.width,
      markerHeight: marker.height,
      headerGap: rect.top - header.bottom,
      xBottomGap: rect.bottom - labels[0].bottom,
      allInside: boxes.every(b => b.left >= rect.left && b.right <= rect.right && b.top >= rect.top && b.bottom <= rect.bottom),
      labelsOverlap: labels.some((b, i) => i > 0 && b.left < labels[i-1].right + 2),
      scaledText: [...svg.querySelectorAll('text')].some(el => getComputedStyle(el).transform !== 'none'),
      color: getComputedStyle(svg.querySelector('.chart-stroke')).stroke,
      path: svg.querySelector('.chart-stroke').getAttribute('d'),
      gradientBottom: Number(svg.querySelector('linearGradient').getAttribute('y2')),
      baseline: Math.max(...grid),
    };
  });
}

test('actual SVG geometry fills 350/450/550px panels without scaling labels or markers', async ({ page }) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(url);
  await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:1000});
    for(const theme of ['light','dark']) {
      await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
      let previous;
      for(const height of [350,450,550]) {
        await page.locator('.dashboard-activity').evaluate((el,h)=>el.style.height=h+'px',height);
        await sizeSettled(page);
        const state=await inspect(page);
        expect(state.allInside,`${width}px ${height}px: labels/markers clipped`).toBe(true);
        expect(state.labelsOverlap).toBe(false);
        expect(state.scaledText).toBe(false);
        expect(state.headerGap).toBeGreaterThanOrEqual(8);
        expect(state.xBottomGap).toBeGreaterThanOrEqual(2);
        expect(state.xBottomGap).toBeLessThan(15);
        expect(state.plotHeight/state.height).toBeGreaterThan(.75);
        expect(state.gradientBottom).toBe(state.baseline);
        expect(state.color).toBe('rgb(253, 95, 1)');
        expect(state.path).toContain(' C ');
        expect(Math.abs(state.markerWidth-state.markerHeight)).toBeLessThan(.1);
        if(previous) {
          expect(state.plotHeight-previous.plotHeight).toBeCloseTo(100,0);
          expect(state.fontHeight).toBeCloseTo(previous.fontHeight,1);
          expect(state.markerWidth).toBeCloseTo(previous.markerWidth,1);
        }
        previous=state;
      }
    }
    await page.locator('#activity-period').selectOption('14');
    await sizeSettled(page);
    await expect(page.locator('.chart-dot')).toHaveCount(14);
    expect((await inspect(page)).labelsOverlap).toBe(false);
    await page.locator('#activity-period').selectOption('7');
  }
  // A parent-only width change must redraw without a window resize or app render.
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.dashboard-activity').evaluate(el=>el.style.width='500px');
  await sizeSettled(page);
  await page.locator('.dashboard-activity').evaluate(el=>el.style.width='720px');
  await sizeSettled(page);
  expect((await inspect(page)).labelsOverlap).toBe(false);
  await page.evaluate(()=>location.hash='library');
  await expect(page.locator('h1')).toContainText('Kho từ vựng');
  await page.evaluate(()=>location.hash='dashboard');
  await expect(page.locator('.chart-dot')).toHaveCount(7);
  await sizeSettled(page);
  expect(errors).toEqual([]);
});
