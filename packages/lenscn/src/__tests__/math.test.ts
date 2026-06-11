import { describe, it, expect } from 'vitest'
import { erf, roundedRectSDF, computeDomeConstants } from '../math'

describe('erf', () => {
  it('erf(0) = 0', () => {
    expect(erf(0)).toBe(0)
  })

  it('odd symmetry: erf(-x) = -erf(x)', () => {
    for (const x of [0.1, 0.5, 1, 2, 3]) {
      expect(erf(-x)).toBeCloseTo(-erf(x), 10)
    }
  })

  it('approaches +1 at +3', () => {
    expect(erf(3)).toBeGreaterThan(0.99)
  })

  it('approaches -1 at -3', () => {
    expect(erf(-3)).toBeLessThan(-0.99)
  })
})

describe('roundedRectSDF', () => {
  it('negative inside the rect (no radius)', () => {
    // Point (1,1) inside 10x10 half-rect (halfW=10, halfH=10)
    expect(roundedRectSDF(1, 1, 10, 10, 0)).toBeLessThan(0)
  })

  it('positive outside the rect (no radius)', () => {
    // Point (12,0) outside 10x10 half-rect
    expect(roundedRectSDF(12, 0, 10, 10, 0)).toBeGreaterThan(0)
  })

  it('correct distance on horizontal axis', () => {
    // Pixel at x=15, y=0, halfW=10: 5 outside
    expect(roundedRectSDF(15, 0, 10, 10, 0)).toBeCloseTo(5, 5)
  })

  it('correct distance on vertical axis', () => {
    // Pixel at x=0, y=13, halfH=10: 3 outside
    expect(roundedRectSDF(0, 13, 10, 10, 0)).toBeCloseTo(3, 5)
  })

  it('negative inside with corner radius', () => {
    // Center of a 10x10 rect with radius 3 — well inside
    expect(roundedRectSDF(0, 0, 10, 10, 3)).toBeLessThan(0)
  })

  it('corner point is outside when radius pushes it', () => {
    // Exact corner (10,10) of a rect with radius 2 should be outside
    expect(roundedRectSDF(10, 10, 10, 10, 2)).toBeGreaterThan(0)
  })
})

describe('computeDomeConstants', () => {
  it('Rx = (halfW² + d²) / (2d)', () => {
    const halfW = 50
    const halfH = 50
    const depth = 10
    const c = computeDomeConstants(depth, halfW, halfH)
    const expectedRx = (halfW * halfW + depth * depth) / (2 * depth)
    expect(c.Rx).toBeCloseTo(expectedRx, 5)
  })

  it('Ry = (halfH² + d²) / (2d)', () => {
    const halfW = 40
    const halfH = 60
    const depth = 8
    const c = computeDomeConstants(depth, halfW, halfH)
    const expectedRy = (halfH * halfH + depth * depth) / (2 * depth)
    expect(c.Ry).toBeCloseTo(expectedRy, 5)
  })

  it('scaleX and scaleY are positive and finite', () => {
    const c = computeDomeConstants(10, 50, 50)
    expect(c.scaleX).toBeGreaterThan(0)
    expect(c.scaleY).toBeGreaterThan(0)
    expect(isFinite(c.scaleX)).toBe(true)
    expect(isFinite(c.scaleY)).toBe(true)
  })

  it('handles non-square lens', () => {
    const c = computeDomeConstants(5, 100, 30)
    expect(c.Rx).toBeGreaterThan(c.Ry)
    expect(isFinite(c.scaleX)).toBe(true)
    expect(isFinite(c.scaleY)).toBe(true)
  })
})
