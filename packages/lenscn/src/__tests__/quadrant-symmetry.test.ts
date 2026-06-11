import { describe, it, expect } from 'vitest'
import { writeLensMapPixels, writeLensMapPixelsNaive } from '../lens-map'

const SIZE = 96

function maxChannelDiff(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
  let m = 0
  for (let i = 0; i < a.length; i++) {
    const d = Math.abs(a[i] - b[i])
    if (d > m) m = d
  }
  return m
}

const fixtures = [
  {
    name: 'linear, no specular',
    options: { width: 200, height: 120, borderRadius: 50, depth: 30 },
  },
  {
    name: 'dome profile',
    options: { width: 180, height: 180, borderRadius: 30, depth: 24, domeDepth: 28 },
  },
  {
    name: 'splay < 1',
    options: { width: 220, height: 140, borderRadius: 70, depth: 36, splay: 0.6 },
  },
  {
    name: 'specular on (glow + edge)',
    options: {
      width: 220,
      height: 140,
      borderRadius: 70,
      depth: 36,
      glowStrength: 0.35,
      edgeStrength: 0.25,
    },
  },
  {
    name: 'square with no radius, no depth',
    options: { width: 160, height: 160, borderRadius: 0, depth: 0, edgeFalloff: false },
  },
  {
    name: 'small splay + dome + specular',
    options: {
      width: 120,
      height: 240,
      borderRadius: 60,
      depth: 18,
      domeDepth: 12,
      splay: 0.85,
      glowStrength: 0.2,
      edgeStrength: 0.4,
    },
  },
]

describe('quadrant-symmetry optimization', () => {
  for (const fx of fixtures) {
    it(`matches naive path within 1 per channel — ${fx.name}`, () => {
      const opt = { ...fx.options, resolution: SIZE } as Parameters<
        typeof writeLensMapPixels
      >[1]
      const fast = new Uint8ClampedArray(SIZE * SIZE * 4)
      const naive = new Uint8ClampedArray(SIZE * SIZE * 4)
      writeLensMapPixels(fast, opt)
      writeLensMapPixelsNaive(naive, opt)
      expect(maxChannelDiff(fast, naive)).toBeLessThanOrEqual(1)
    })
  }
})
