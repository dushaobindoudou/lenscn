import { describe, it, expect, beforeAll } from 'vitest'
import { generateLensMap, releaseLensMap } from '../lens-map'

// Minimal canvas stub so generateLensMap can run in plain Node. We don't
// need to actually render pixels — we only need cache identity semantics.
beforeAll(() => {
  let n = 0
  // Minimal canvas stub so generateLensMap can run in plain Node. We
  // don't need real rendering — only cache identity semantics.
  ;(globalThis as Record<string, unknown>).document = {
    createElement(tag: string) {
      if (tag !== 'canvas') throw new Error(`stub: unknown tag ${tag}`)
      return {
        width: 0,
        height: 0,
        toDataURL() {
          return `data:image/png;base64,STUB-${++n}`
        },
        getContext(_kind: string) {
          return {
            createImageData(w: number, h: number) {
              return { data: new Uint8ClampedArray(w * h * 4) }
            },
            putImageData() {
              /* no-op */
            },
          }
        },
      }
    },
  }
})

describe('shared map cache', () => {
  it('returns the same map for equal options', () => {
    const opts = { width: 200, height: 140, borderRadius: 50, depth: 30, resolution: 96 }
    const a = generateLensMap(opts)
    const b = generateLensMap(opts)
    expect(a).toBe(b)
    expect(a.url).toBe(b.url)
    releaseLensMap(a)
    releaseLensMap(b)
  })

  it('returns a different map for different options', () => {
    const a = generateLensMap({ width: 200, height: 140, borderRadius: 50, depth: 30, resolution: 96 })
    const b = generateLensMap({ width: 200, height: 140, borderRadius: 60, depth: 30, resolution: 96 })
    expect(a).not.toBe(b)
    expect(a.url).not.toBe(b.url)
    releaseLensMap(a)
    releaseLensMap(b)
  })

  it('treats options with same canonical value as the same map', () => {
    // Both spread to the same defaults.
    const a = generateLensMap({ width: 200, height: 140, borderRadius: 50, depth: 30, resolution: 96 })
    const b = generateLensMap({ width: 200, height: 140, borderRadius: 50, depth: 30, resolution: 96, edgeFalloff: true })
    expect(a).toBe(b)
    releaseLensMap(a)
    releaseLensMap(b)
  })

  it('release decrements refcount and re-generates after purge', () => {
    const opts = { width: 180, height: 120, borderRadius: 40, depth: 24, resolution: 96 }
    const a = generateLensMap(opts)
    const b = generateLensMap(opts)
    expect(a).toBe(b)
    releaseLensMap(a)
    releaseLensMap(b)
    // Both refs released → entry purged. Next call regenerates a new object.
    const c = generateLensMap(opts)
    expect(c).not.toBe(a)
    releaseLensMap(c)
  })
})
