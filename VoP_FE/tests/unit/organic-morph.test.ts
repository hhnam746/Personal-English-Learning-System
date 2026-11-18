import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildMorphedPaths,
  getBasePaths,
  BLOB_DEFINITIONS,
  type BlobVariant
} from '../../src/components/organic-morph.ts'

function parsePath(d: string) {
  const tokens = d.trim().split(/\s+/)
  let i = 0
  assert.equal(tokens[i], 'M')
  const start = [parseFloat(tokens[i + 1]), parseFloat(tokens[i + 2])]
  i += 3
  const segments: Array<{
    cp1: [number, number]
    cp2: [number, number]
    end: [number, number]
  }> = []
  while (i < tokens.length) {
    if (tokens[i] === 'Z') break
    assert.equal(tokens[i], 'C')
    segments.push({
      cp1: [parseFloat(tokens[i + 1]), parseFloat(tokens[i + 2])],
      cp2: [parseFloat(tokens[i + 3]), parseFloat(tokens[i + 4])],
      end: [parseFloat(tokens[i + 5]), parseFloat(tokens[i + 6])]
    })
    i += 7
  }
  return { start, segments }
}

test('base paths match initial blob definitions and segment counts', () => {
  for (const variant of ['summary', 'accuracy', 'brain'] as BlobVariant[]) {
    const base = getBasePaths(variant)
    const def = BLOB_DEFINITIONS[variant]
    const parsed = parsePath(base.closedPath)
    assert.equal(parsed.segments.length, def.segments.length)
    assert.ok(base.closedPath.startsWith('M '))
    assert.ok(base.closedPath.endsWith(' Z'))
    assert.ok(base.topHighlightPath.startsWith('M '))
    assert.ok(base.lowerHighlightPath.startsWith('M '))
  }
})

test('morphed paths produce compatible cubic Bézier paths across time', () => {
  for (const variant of ['summary', 'accuracy', 'brain'] as BlobVariant[]) {
    const def = BLOB_DEFINITIONS[variant]
    for (const t of [0.5, 1.2, 3.7, 8.4, 15.0]) {
      const morphed = buildMorphedPaths(variant, t, 400, 300, 1)
      const parsed = parsePath(morphed.closedPath)
      assert.equal(parsed.segments.length, def.segments.length)
      // Check that final segment end matches start point (closed loop)
      const finalEnd = parsed.segments[parsed.segments.length - 1].end
      assert.ok(Math.abs(parsed.start[0] - finalEnd[0]) < 1e-4)
      assert.ok(Math.abs(parsed.start[1] - finalEnd[1]) < 1e-4)
    }
  }
})

test('highlights remain perfectly synchronized with corresponding closed path segments', () => {
  for (const variant of ['summary', 'accuracy', 'brain'] as BlobVariant[]) {
    const def = BLOB_DEFINITIONS[variant]
    const N = def.segments.length
    for (const t of [1.0, 5.5, 11.2]) {
      const morphed = buildMorphedPaths(variant, t, 400, 300, 1)
      const parsedClosed = parsePath(morphed.closedPath)
      const parsedTop = parsePath(morphed.topHighlightPath)
      const parsedLower = parsePath(morphed.lowerHighlightPath)

      // Top highlight verification
      const topStartSeg = def.topHighlight.startSeg
      const topStartPt =
        parsedClosed.segments[(topStartSeg - 1 + N) % N].end
      assert.ok(Math.abs(parsedTop.start[0] - topStartPt[0]) < 1e-4)
      assert.ok(Math.abs(parsedTop.start[1] - topStartPt[1]) < 1e-4)
      assert.equal(parsedTop.segments.length, def.topHighlight.count)
      for (let c = 0; c < def.topHighlight.count; c++) {
        const segIdx = (topStartSeg + c) % N
        const expectedSeg = parsedClosed.segments[segIdx]
        const actualSeg = parsedTop.segments[c]
        assert.ok(Math.abs(actualSeg.cp1[0] - expectedSeg.cp1[0]) < 1e-4)
        assert.ok(Math.abs(actualSeg.cp2[0] - expectedSeg.cp2[0]) < 1e-4)
        assert.ok(Math.abs(actualSeg.end[0] - expectedSeg.end[0]) < 1e-4)
      }

      // Lower highlight verification
      const lowerStartSeg = def.lowerHighlight.startSeg
      const lowerStartPt =
        parsedClosed.segments[(lowerStartSeg - 1 + N) % N].end
      assert.ok(Math.abs(parsedLower.start[0] - lowerStartPt[0]) < 1e-4)
      assert.ok(Math.abs(parsedLower.start[1] - lowerStartPt[1]) < 1e-4)
      assert.equal(parsedLower.segments.length, def.lowerHighlight.count)
      for (let c = 0; c < def.lowerHighlight.count; c++) {
        const segIdx = (lowerStartSeg + c) % N
        const expectedSeg = parsedClosed.segments[segIdx]
        const actualSeg = parsedLower.segments[c]
        assert.ok(Math.abs(actualSeg.cp1[0] - expectedSeg.cp1[0]) < 1e-4)
        assert.ok(Math.abs(actualSeg.cp2[0] - expectedSeg.cp2[0]) < 1e-4)
        assert.ok(Math.abs(actualSeg.end[0] - expectedSeg.end[0]) < 1e-4)
      }
    }
  }
})

test('contour movement magnitude is 8–16px for large blobs and 4–9px for brain blob', () => {
  // Test Summary Blob (large)
  {
    const W = 400
    const H = 320
    const base = parsePath(getBasePaths('summary').closedPath)
    let minDisp = 999
    let maxDisp = -999

    for (let t = 0; t <= 30; t += 0.2) {
      const morphed = parsePath(buildMorphedPaths('summary', t, W, H, 1).closedPath)
      // Check top vertex (vertex 0)
      const dyPx = (morphed.start[1] - base.start[1]) * H
      minDisp = Math.min(minDisp, dyPx)
      maxDisp = Math.max(maxDisp, dyPx)
    }
    const peakToPeak = maxDisp - minDisp
    assert.ok(
      peakToPeak >= 8 && peakToPeak <= 16,
      `Summary peak-to-peak (${peakToPeak.toFixed(2)}px) should be within 8-16px`
    )
  }

  // Test Accuracy Blob (large)
  {
    const W = 400
    const H = 250
    const base = parsePath(getBasePaths('accuracy').closedPath)
    let minDisp = 999
    let maxDisp = -999

    for (let t = 0; t <= 30; t += 0.2) {
      const morphed = parsePath(buildMorphedPaths('accuracy', t, W, H, 1).closedPath)
      // Check bottom vertex (segment 3 end)
      const dyPx = (morphed.segments[3].end[1] - base.segments[3].end[1]) * H
      minDisp = Math.min(minDisp, dyPx)
      maxDisp = Math.max(maxDisp, dyPx)
    }
    const peakToPeak = maxDisp - minDisp
    assert.ok(
      peakToPeak >= 8 && peakToPeak <= 16,
      `Accuracy peak-to-peak (${peakToPeak.toFixed(2)}px) should be within 8-16px`
    )
  }

  // Test Brain Blob (compact)
  {
    const W = 160
    const H = 156
    const base = parsePath(getBasePaths('brain').closedPath)
    let minDisp = 999
    let maxDisp = -999

    for (let t = 0; t <= 30; t += 0.2) {
      const morphed = parsePath(buildMorphedPaths('brain', t, W, H, 1).closedPath)
      // Check top vertex (vertex 0)
      const dyPx = (morphed.start[1] - base.start[1]) * H
      minDisp = Math.min(minDisp, dyPx)
      maxDisp = Math.max(maxDisp, dyPx)
    }
    const peakToPeak = maxDisp - minDisp
    assert.ok(
      peakToPeak >= 4 && peakToPeak <= 9,
      `Brain peak-to-peak (${peakToPeak.toFixed(2)}px) should be within 4-9px`
    )
  }
})

test('upper, lower, left, and right contours deform independently with nonuniform movement', () => {
  const W = 400
  const H = 320
  const base = parsePath(getBasePaths('summary').closedPath)

  // Track movement vectors over 10 sampled time steps
  const topOffsets: number[] = []
  const bottomOffsets: number[] = []
  const leftOffsets: number[] = []
  const rightOffsets: number[] = []

  for (let t = 1; t <= 10; t += 1) {
    const morphed = parsePath(buildMorphedPaths('summary', t, W, H, 1).closedPath)
    topOffsets.push((morphed.start[1] - base.start[1]) * H)
    bottomOffsets.push((morphed.segments[3].end[1] - base.segments[3].end[1]) * H)
    leftOffsets.push((morphed.segments[5].end[0] - base.segments[5].end[0]) * W)
    rightOffsets.push((morphed.segments[1].end[0] - base.segments[1].end[0]) * W)
  }

  // Contours must not move in lockstep (i.e. not identical offsets)
  assert.notDeepEqual(topOffsets, bottomOffsets)
  assert.notDeepEqual(leftOffsets, rightOffsets)

  // Correlation between top and bottom should be far from +1 (not a uniform vertical shift)
  let sumDiff = 0
  for (let i = 0; i < topOffsets.length; i++) {
    sumDiff += Math.abs(topOffsets[i] - bottomOffsets[i])
  }
  assert.ok(sumDiff > 10, 'Top and bottom should deform independently')
})

test('ramp = 0 or reduced motion preserves base static path geometry', () => {
  for (const variant of ['summary', 'accuracy', 'brain'] as BlobVariant[]) {
    const base = getBasePaths(variant)
    const zeroRamp = buildMorphedPaths(variant, 12.34, 400, 300, 0)
    assert.equal(zeroRamp.closedPath, base.closedPath)
    assert.equal(zeroRamp.topHighlightPath, base.topHighlightPath)
    assert.equal(zeroRamp.lowerHighlightPath, base.lowerHighlightPath)
  }
})

test('contour movement adapts to viewport dimensions (desktop vs mobile)', () => {
  // Mobile width 320, Desktop width 600
  for (const W of [320, 600]) {
    const H = 300
    const base = parsePath(getBasePaths('summary').closedPath)
    let minDisp = 999
    let maxDisp = -999

    for (let t = 0; t <= 30; t += 0.2) {
      const morphed = parsePath(buildMorphedPaths('summary', t, W, H, 1).closedPath)
      const dyPx = (morphed.start[1] - base.start[1]) * H
      minDisp = Math.min(minDisp, dyPx)
      maxDisp = Math.max(maxDisp, dyPx)
    }
    const peakToPeak = maxDisp - minDisp
    assert.ok(
      peakToPeak >= 8 && peakToPeak <= 16,
      `At W=${W}, peak-to-peak (${peakToPeak.toFixed(2)}px) should remain within 8-16px`
    )
  }
})
