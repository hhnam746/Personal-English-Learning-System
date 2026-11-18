import { useEffect, useRef } from 'react'

export type BlobVariant = 'summary' | 'accuracy' | 'brain'

export interface MorphedBlobPaths {
  closedPath: string
  topHighlightPath: string
  lowerHighlightPath: string
}

interface Segment {
  cp1: [number, number]
  cp2: [number, number]
  end: [number, number]
}

interface BlobDef {
  basePath: string
  start: [number, number]
  segments: Segment[]
  topHighlight: { startSeg: number; count: number }
  lowerHighlight: { startSeg: number; count: number }
  targetPx: number
  defaultWidth: number
  defaultHeight: number
  phase: number
}

export const BLOB_DEFINITIONS: Record<BlobVariant, BlobDef> = {
  summary: {
    basePath:
      'M .355 .018 C .473 .004 .507 .079 .641 .133 C .766 .184 .887 .177 .949 .377 C .997 .546 .995 .724 .914 .843 C .845 .945 .750 .920 .647 .928 C .533 .938 .490 .996 .364 .971 C .214 .935 .116 .865 .061 .714 C .006 .538 .003 .332 .082 .176 C .139 .072 .241 .030 .355 .018 Z',
    start: [0.355, 0.018],
    segments: [
      { cp1: [0.473, 0.004], cp2: [0.507, 0.079], end: [0.641, 0.133] },
      { cp1: [0.766, 0.184], cp2: [0.887, 0.177], end: [0.949, 0.377] },
      { cp1: [0.997, 0.546], cp2: [0.995, 0.724], end: [0.914, 0.843] },
      { cp1: [0.845, 0.945], cp2: [0.75, 0.92], end: [0.647, 0.928] },
      { cp1: [0.533, 0.938], cp2: [0.49, 0.996], end: [0.364, 0.971] },
      { cp1: [0.214, 0.935], cp2: [0.116, 0.865], end: [0.061, 0.714] },
      { cp1: [0.006, 0.538], cp2: [0.003, 0.332], end: [0.082, 0.176] },
      { cp1: [0.139, 0.072], cp2: [0.241, 0.03], end: [0.355, 0.018] }
    ],
    topHighlight: { startSeg: 7, count: 2 },
    lowerHighlight: { startSeg: 3, count: 2 },
    targetPx: 6.0,
    defaultWidth: 400,
    defaultHeight: 320,
    phase: 0.0
  },
  accuracy: {
    basePath:
      'M .116 .018 C .323 .010 .539 .038 .792 .019 C .918 .001 .985 .084 .992 .304 C .999 .554 .982 .799 .894 .900 C .808 .978 .583 .955 .368 .970 C .233 .981 .161 1.001 .091 .965 C .015 .927 .004 .756 .008 .515 C .012 .263 .027 .037 .116 .018 Z',
    start: [0.116, 0.018],
    segments: [
      { cp1: [0.323, 0.01], cp2: [0.539, 0.038], end: [0.792, 0.019] },
      { cp1: [0.918, 0.001], cp2: [0.985, 0.084], end: [0.992, 0.304] },
      { cp1: [0.999, 0.554], cp2: [0.982, 0.799], end: [0.894, 0.9] },
      { cp1: [0.808, 0.978], cp2: [0.583, 0.955], end: [0.368, 0.97] },
      { cp1: [0.233, 0.981], cp2: [0.161, 1.001], end: [0.091, 0.965] },
      { cp1: [0.015, 0.927], cp2: [0.004, 0.756], end: [0.008, 0.515] },
      { cp1: [0.012, 0.263], cp2: [0.027, 0.037], end: [0.116, 0.018] }
    ],
    topHighlight: { startSeg: 6, count: 2 },
    lowerHighlight: { startSeg: 3, count: 2 },
    targetPx: 6.0,
    defaultWidth: 400,
    defaultHeight: 250,
    phase: 2.1
  },
  brain: {
    basePath:
      'M .730 .026 C .881 .005 .982 .136 .970 .301 C .960 .468 .862 .568 .833 .730 C .810 .891 .733 .983 .610 .958 C .488 .933 .474 .799 .364 .734 C .250 .666 .090 .673 .048 .558 C .002 .432 .116 .305 .253 .197 C .388 .090 .568 .049 .730 .026 Z',
    start: [0.73, 0.026],
    segments: [
      { cp1: [0.881, 0.005], cp2: [0.982, 0.136], end: [0.97, 0.301] },
      { cp1: [0.96, 0.468], cp2: [0.862, 0.568], end: [0.833, 0.73] },
      { cp1: [0.81, 0.891], cp2: [0.733, 0.983], end: [0.61, 0.958] },
      { cp1: [0.488, 0.933], cp2: [0.474, 0.799], end: [0.364, 0.734] },
      { cp1: [0.25, 0.666], cp2: [0.09, 0.673], end: [0.048, 0.558] },
      { cp1: [0.002, 0.432], cp2: [0.116, 0.305], end: [0.253, 0.197] },
      { cp1: [0.388, 0.09], cp2: [0.568, 0.049], end: [0.73, 0.026] }
    ],
    topHighlight: { startSeg: 6, count: 2 },
    lowerHighlight: { startSeg: 2, count: 2 },
    targetPx: 3.25,
    defaultWidth: 160,
    defaultHeight: 156,
    phase: 4.2
  }
}

function fmt(n: number): string {
  const s = n.toFixed(3)
  if (s.startsWith('0.')) return s.slice(1)
  if (s.startsWith('-0.')) return '-' + s.slice(2)
  return s
}

export function buildMorphedPaths(
  variant: BlobVariant,
  tSec: number,
  width?: number,
  height?: number,
  ramp = 1
): MorphedBlobPaths {
  const def = BLOB_DEFINITIONS[variant]
  const N = def.segments.length

  if (ramp <= 0) {
    return getBasePaths(variant)
  }

  const W = Math.max(width || def.defaultWidth, 100)
  const H = Math.max(height || def.defaultHeight, 100)
  const targetPx = def.targetPx * ramp
  const scaleX = targetPx / W
  const scaleY = targetPx / H
  const t = tSec + def.phase

  function getDelta(x: number, y: number): [number, number] {
    const fU1 = 0.72
    const fU2 = 1.15
    const vUpper =
      0.75 * Math.sin(fU1 * t + 2.5 * x) + 0.35 * Math.cos(fU2 * t - 1.8 * x)
    const dyU = -vUpper * scaleY
    const dxU = 0.4 * Math.cos(fU1 * t + 1.5 * x) * scaleX

    const fD1 = 0.61
    const fD2 = 1.05
    const vLower =
      0.75 * Math.sin(fD1 * t - 2.2 * x + 1.2) +
      0.35 * Math.sin(fD2 * t + 2.0 * x + 0.5)
    const dyD = vLower * scaleY
    const dxD = 0.4 * Math.sin(fD1 * t - 1.7 * x) * scaleX

    const fL1 = 0.68
    const fL2 = 1.28
    const vLeft =
      0.75 * Math.cos(fL1 * t + 2.4 * y + 2.1) +
      0.35 * Math.sin(fL2 * t - 1.9 * y + 1.0)
    const dxL = -vLeft * scaleX
    const dyL = 0.4 * Math.sin(fL1 * t + 1.6 * y) * scaleY

    const fR1 = 0.58
    const fR2 = 1.1
    const vRight =
      0.75 * Math.sin(fR1 * t - 2.6 * y + 3.4) +
      0.35 * Math.cos(fR2 * t + 1.7 * y + 2.2)
    const dxR = vRight * scaleX
    const dyR = 0.4 * Math.cos(fR1 * t - 1.5 * y) * scaleY

    const wu = Math.max(0, 1 - y / 0.5) ** 2
    const wd = Math.max(0, (y - 0.5) / 0.5) ** 2
    const wl = Math.max(0, 1 - x / 0.5) ** 2
    const wr = Math.max(0, (x - 0.5) / 0.5) ** 2
    const sum = wu + wd + wl + wr
    if (sum < 1e-6) return [0, 0]
    const norm = Math.sqrt(sum)
    return [
      (wu * dxU + wd * dxD + wl * dxL + wr * dxR) / norm,
      (wu * dyU + wd * dyD + wl * dyL + wr * dyR) / norm
    ]
  }

  const vertexDeltas: [number, number][] = []
  const startDelta = getDelta(def.start[0], def.start[1])
  vertexDeltas.push(startDelta)
  for (let k = 0; k < N; k++) {
    if (k === N - 1) {
      vertexDeltas.push(startDelta)
    } else {
      const pt = def.segments[k].end
      vertexDeltas.push(getDelta(pt[0], pt[1]))
    }
  }

  const defStart: [number, number] = [
    def.start[0] + startDelta[0],
    def.start[1] + startDelta[1]
  ]
  const defSegments: Segment[] = []

  for (let k = 0; k < N; k++) {
    const dStart = vertexDeltas[k]
    const dEnd = vertexDeltas[k + 1]
    const dCp1: [number, number] = [
      (2 * dStart[0] + dEnd[0]) / 3,
      (2 * dStart[1] + dEnd[1]) / 3
    ]
    const dCp2: [number, number] = [
      (dStart[0] + 2 * dEnd[0]) / 3,
      (dStart[1] + 2 * dEnd[1]) / 3
    ]

    const seg = def.segments[k]
    defSegments.push({
      cp1: [seg.cp1[0] + dCp1[0], seg.cp1[1] + dCp1[1]],
      cp2: [seg.cp2[0] + dCp2[0], seg.cp2[1] + dCp2[1]],
      end: [seg.end[0] + dEnd[0], seg.end[1] + dEnd[1]]
    })
  }

  let closedPath = `M ${fmt(defStart[0])} ${fmt(defStart[1])}`
  for (let k = 0; k < N; k++) {
    const s = defSegments[k]
    closedPath += ` C ${fmt(s.cp1[0])} ${fmt(s.cp1[1])} ${fmt(s.cp2[0])} ${fmt(s.cp2[1])} ${fmt(s.end[0])} ${fmt(s.end[1])}`
  }
  closedPath += ' Z'

  function makeSubpath(startSeg: number, count: number): string {
    const prevSegIdx = (startSeg - 1 + N) % N
    const startPt = defSegments[prevSegIdx].end
    let p = `M ${fmt(startPt[0])} ${fmt(startPt[1])}`
    for (let c = 0; c < count; c++) {
      const segIdx = (startSeg + c) % N
      const s = defSegments[segIdx]
      p += ` C ${fmt(s.cp1[0])} ${fmt(s.cp1[1])} ${fmt(s.cp2[0])} ${fmt(s.cp2[1])} ${fmt(s.end[0])} ${fmt(s.end[1])}`
    }
    return p
  }

  const topHighlightPath = makeSubpath(
    def.topHighlight.startSeg,
    def.topHighlight.count
  )
  const lowerHighlightPath = makeSubpath(
    def.lowerHighlight.startSeg,
    def.lowerHighlight.count
  )

  return { closedPath, topHighlightPath, lowerHighlightPath }
}

export function getBasePaths(variant: BlobVariant): MorphedBlobPaths {
  const def = BLOB_DEFINITIONS[variant]
  const N = def.segments.length

  let closedPath = `M ${fmt(def.start[0])} ${fmt(def.start[1])}`
  for (let k = 0; k < N; k++) {
    const s = def.segments[k]
    closedPath += ` C ${fmt(s.cp1[0])} ${fmt(s.cp1[1])} ${fmt(s.cp2[0])} ${fmt(s.cp2[1])} ${fmt(s.end[0])} ${fmt(s.end[1])}`
  }
  closedPath += ' Z'

  function makeSubpath(startSeg: number, count: number): string {
    const prevSegIdx = (startSeg - 1 + N) % N
    const startPt = def.segments[prevSegIdx].end
    let p = `M ${fmt(startPt[0])} ${fmt(startPt[1])}`
    for (let c = 0; c < count; c++) {
      const segIdx = (startSeg + c) % N
      const s = def.segments[segIdx]
      p += ` C ${fmt(s.cp1[0])} ${fmt(s.cp1[1])} ${fmt(s.cp2[0])} ${fmt(s.cp2[1])} ${fmt(s.end[0])} ${fmt(s.end[1])}`
    }
    return p
  }

  return {
    closedPath,
    topHighlightPath: makeSubpath(
      def.topHighlight.startSeg,
      def.topHighlight.count
    ),
    lowerHighlightPath: makeSubpath(
      def.lowerHighlight.startSeg,
      def.lowerHighlight.count
    )
  }
}

export function useOrganicMorph(variant: BlobVariant) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window === 'undefined') return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Query direct children only, avoiding picking up nested child blobs (e.g. Brain inside Accuracy)
    const defsSvg = Array.from(container.children).find((el) =>
      el.classList.contains('organic-blob__defs')
    ) as SVGSVGElement | undefined

    const shadowSvg = Array.from(container.children).find((el) =>
      el.classList.contains('organic-blob__shadow')
    ) as SVGSVGElement | undefined

    const edgeSvg = Array.from(container.children).find((el) =>
      el.classList.contains('organic-blob__edge')
    ) as SVGSVGElement | undefined

    const clipPathEl = defsSvg?.querySelector('clipPath path') as
      | SVGPathElement
      | null
      | undefined
    const shadowPathEl = shadowSvg?.querySelector('path') as
      | SVGPathElement
      | null
      | undefined

    const bodyPathEls = edgeSvg
      ? (Array.from(
          edgeSvg.querySelectorAll('.organic-blob__body')
        ) as SVGPathElement[])
      : []
    const thicknessPathEl = edgeSvg?.querySelector('.organic-blob__thickness') as
      | SVGPathElement
      | null
      | undefined
    const innerEdgePathEl = edgeSvg?.querySelector(
      '.organic-blob__inner-edge'
    ) as SVGPathElement | null | undefined
    const outlinePathEl = edgeSvg?.querySelector('.organic-blob__outline') as
      | SVGPathElement
      | null
      | undefined
    const topHighlightPathEl = edgeSvg?.querySelector(
      '.organic-blob__highlight:not(.organic-blob__highlight--lower)'
    ) as SVGPathElement | null | undefined
    const lowerHighlightPathEl = edgeSvg?.querySelector(
      '.organic-blob__highlight--lower'
    ) as SVGPathElement | null | undefined

    const closedPathEls = [
      clipPathEl,
      shadowPathEl,
      ...bodyPathEls,
      thicknessPathEl,
      innerEdgePathEl,
      outlinePathEl
    ].filter(Boolean) as SVGPathElement[]

    const applyPaths = (paths: MorphedBlobPaths) => {
      for (let i = 0; i < closedPathEls.length; i++) {
        closedPathEls[i].setAttribute('d', paths.closedPath)
      }
      if (topHighlightPathEl) {
        topHighlightPathEl.setAttribute('d', paths.topHighlightPath)
      }
      if (lowerHighlightPathEl) {
        lowerHighlightPathEl.setAttribute('d', paths.lowerHighlightPath)
      }
    }

    const resetToBase = () => {
      applyPaths(getBasePaths(variant))
    }

    if (mql.matches) {
      resetToBase()
      const onPreferenceChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          resetToBase()
        } else {
          startLoop()
        }
      }
      mql.addEventListener('change', onPreferenceChange)
      return () => {
        mql.removeEventListener('change', onPreferenceChange)
      }
    }

    const def = BLOB_DEFINITIONS[variant]
    let width = container.clientWidth || def.defaultWidth
    let height = container.clientHeight || def.defaultHeight

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect) {
            width = entry.contentRect.width || width
            height = entry.contentRect.height || height
          }
        }
      })
      ro.observe(container)
    }

    let startTime: number | null = null
    let rafId: number | null = null
    let isRunning = false

    const tick = (now: number) => {
      if (!isRunning) return
      if (startTime === null) startTime = now
      const elapsed = (now - startTime) / 1000
      const ramp = Math.min(1, elapsed / 0.8)

      const paths = buildMorphedPaths(variant, elapsed, width, height, ramp)
      applyPaths(paths)

      rafId = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (isRunning) return
      isRunning = true
      startTime = null
      rafId = requestAnimationFrame(tick)
    }

    const stopLoop = () => {
      isRunning = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      resetToBase()
    }

    const onPreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        stopLoop()
      } else {
        startLoop()
      }
    }

    mql.addEventListener('change', onPreferenceChange)
    startLoop()

    return () => {
      isRunning = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (ro) {
        ro.disconnect()
      }
      mql.removeEventListener('change', onPreferenceChange)
    }
  }, [variant])

  return containerRef
}

