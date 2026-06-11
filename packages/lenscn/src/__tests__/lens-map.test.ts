import { describe, it, expect } from 'vitest'
import { writeLensMapPixels } from '../lens-map'

const SIZE = 64

function makeMap(options: Parameters<typeof writeLensMapPixels>[1]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4)
  writeLensMapPixels(data, { resolution: SIZE, ...options })
  return data
}

function pixelAt(data: Uint8ClampedArray, px: number, py: number) {
  const idx = (py * SIZE + px) * 4
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] }
}

describe('writeLensMapPixels map properties', () => {
  const baseOptions = {
    width: 64,
    height: 64,
    borderRadius: 16,
    depth: 12,
  }

  it('every pixel outside the shape is exactly (128,128,128,255)', () => {
    const data = makeMap(baseOptions)
    // Check several known-outside pixels (top-left corner region)
    const corners = [
      [0, 0],
      [1, 0],
      [0, 1],
      [SIZE - 1, 0],
      [0, SIZE - 1],
      [SIZE - 1, SIZE - 1],
    ]
    for (const [px, py] of corners) {
      const p = pixelAt(data, px, py)
      expect(p.r).toBe(128)
      expect(p.g).toBe(128)
      expect(p.b).toBe(128)
      expect(p.a).toBe(255)
    }
  })

  it('center pixel is approximately neutral (|R-128| ≤ 2, |G-128| ≤ 2)', () => {
    const data = makeMap(baseOptions)
    const cx = Math.floor(SIZE / 2)
    const cy = Math.floor(SIZE / 2)
    const p = pixelAt(data, cx, cy)
    expect(Math.abs(p.r - 128)).toBeLessThanOrEqual(2)
    expect(Math.abs(p.g - 128)).toBeLessThanOrEqual(2)
    expect(p.a).toBe(255)
  })

  it('alpha is 255 everywhere', () => {
    const data = makeMap(baseOptions)
    for (let i = 3; i < data.length; i += 4) {
      expect(data[i]).toBe(255)
    }
  })

  it('horizontal mirror symmetry: R(x) + R(mirror_x) ≈ 255 ± 1', () => {
    const data = makeMap(baseOptions)
    // Test a row through the center
    const cy = Math.floor(SIZE / 2)
    for (let px = 1; px < SIZE / 2 - 1; px++) {
      const left = pixelAt(data, px, cy)
      const right = pixelAt(data, SIZE - 1 - px, cy)
      // Only check non-neutral pixels (inside the shape)
      if (left.r !== 128 || left.g !== 128) {
        const sum = left.r + right.r
        expect(Math.abs(sum - 255)).toBeLessThanOrEqual(1)
        // G should be equal for horizontal mirror
        expect(Math.abs(left.g - right.g)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('vertical mirror symmetry: G(y) + G(mirror_y) ≈ 255 ± 1', () => {
    const data = makeMap(baseOptions)
    // Test a column through the center
    const cx = Math.floor(SIZE / 2)
    for (let py = 1; py < SIZE / 2 - 1; py++) {
      const top = pixelAt(data, cx, py)
      const bottom = pixelAt(data, cx, SIZE - 1 - py)
      if (top.r !== 128 || top.g !== 128) {
        const sum = top.g + bottom.g
        expect(Math.abs(sum - 255)).toBeLessThanOrEqual(1)
        // R should be equal for vertical mirror
        expect(Math.abs(top.r - bottom.r)).toBeLessThanOrEqual(1)
      }
    }
  })
})
