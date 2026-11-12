import type { DailyActivity } from './types'
export function activityGeometry(
  days: DailyActivity[],
  width: number,
  height: number
) {
  const max = Math.max(
    4,
    Math.ceil(Math.max(0, ...days.map((d) => d.assessmentAnswers)) / 4) * 4
  )
  const left = Math.max(30, String(max).length * 7 + 12),
    right = Math.max(left + 1, width - 14),
    top = 12,
    bottom = Math.max(top + 1, height - 28)
  const step = (right - left) / Math.max(1, days.length - 1)
  const points = days.map((d, i) => ({
    x: left + i * step,
    y: bottom - (d.assessmentAnswers / max) * (bottom - top)
  }))
  const slopes = points.slice(1).map((p, i) => (p.y - points[i].y) / step)
  const tangents = points.map((_, i) =>
    i === 0
      ? slopes[0] || 0
      : i === points.length - 1
        ? slopes[i - 1] || 0
        : slopes[i - 1] * slopes[i] > 0
          ? (2 * slopes[i - 1] * slopes[i]) / (slopes[i - 1] + slopes[i])
          : 0
  )
  const line = points.length
    ? `M ${points[0].x},${points[0].y}` +
      points
        .slice(1)
        .map(
          (p, i) =>
            ` C ${points[i].x + step / 3},${points[i].y + (tangents[i] * step) / 3} ${p.x - step / 3},${p.y - (tangents[i + 1] * step) / 3} ${p.x},${p.y}`
        )
        .join('')
    : ''
  const stride = Math.max(1, Math.ceil(30 / step))
  const ticks = points.map((_, i) => i).filter((i) => i % stride === 0)
  const last = points.length - 1
  if (last >= 0 && ticks.at(-1) !== last) {
    if ((last - (ticks.at(-1) || 0)) * step < 25) ticks.pop()
    ticks.push(last)
  }
  return { max, left, right, top, bottom, points, line, ticks }
}
