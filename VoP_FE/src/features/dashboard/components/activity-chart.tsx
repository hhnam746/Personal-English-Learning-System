import { useEffect, useId, useRef, useState } from 'react'
import type { DailyActivity } from '../types'
import { activityGeometry } from '../chart-geometry'
export function ActivityChart({ days }: { days: DailyActivity[] }) {
  const container = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 600, height: 260 })
  const id = useId()
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0)
        setSize((old) =>
          old.width === width && old.height === height ? old : { width, height }
        )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const model = activityGeometry(days, size.width, size.height)
  const label = (date: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${date}T00:00:00Z`))
  return (
    <div
      ref={container}
      className="line-chart"
      role="img"
      aria-label={`Lượt đánh giá theo ngày UTC: ${days.map((d) => `${label(d.date)}: ${d.assessmentAnswers}`).join('; ')}`}
    >
      <svg viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".14" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const y =
            model.bottom -
            ((model.max * i) / 4 / model.max) * (model.bottom - model.top)
          return (
            <g key={i}>
              <line
                className="chart-gridline"
                x1={model.left}
                x2={model.right}
                y1={y}
                y2={y}
              />
              <text
                className="chart-axis"
                x={model.left - 10}
                y={y + 4}
                textAnchor="end"
              >
                {(model.max * i) / 4}
              </text>
            </g>
          )
        })}
        <path
          d={`${model.line} L ${model.right},${model.bottom} L ${model.left},${model.bottom} Z`}
          fill={`url(#${id})`}
        />
        <path className="chart-stroke" d={model.line} />
        {model.points.map((p, i) => (
          <circle
            key={days[i].date}
            className="chart-dot"
            cx={p.x}
            cy={p.y}
            r="4"
          >
            <title>
              {label(days[i].date)}: {days[i].assessmentAnswers} lượt đánh giá
            </title>
          </circle>
        ))}
        {model.ticks.map((i) => (
          <text
            className="chart-axis"
            key={i}
            x={model.points[i].x}
            y={size.height - 8}
            textAnchor="middle"
          >
            {label(days[i].date)}
          </text>
        ))}
      </svg>
    </div>
  )
}
