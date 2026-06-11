import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { Glass } from '../glass'

// happy-dom doesn't ship a real canvas; we stub just the canvas branch
// of createElement so generateLensMap() can run in this environment.
beforeAll(() => {
  const original = document.createElement.bind(document)
  let n = 0
  document.createElement = function (tag: string, options?: ElementCreationOptions) {
    if (tag.toLowerCase() !== 'canvas') return original(tag, options)
    return {
      width: 0,
      height: 0,
      toDataURL() {
        return `data:image/png;base64,STUB-${++n}`
      },
      getContext() {
        return {
          createImageData(w: number, h: number) {
            return { data: new Uint8ClampedArray(w * h * 4) }
          },
          putImageData() {
            /* no-op */
          },
        }
      },
    } as unknown as HTMLCanvasElement
  } as typeof document.createElement
})

afterEach(() => cleanup())

describe('<Glass>', () => {
  it('attaches an SVG filter on mount and clears it on unmount', async () => {
    const { container, unmount } = render(
      <Glass lens={{ width: 68, height: 68, borderRadius: 34 }}>track</Glass>,
    )
    // Let the map effect resolve and the filter effect create the SVG.
    await new Promise((r) => setTimeout(r, 0))
    const host = container.querySelector('div') as HTMLElement
    expect(host).toBeTruthy()
    // Filter applied via style.filter.
    expect(host.style.filter).toMatch(/url\(#lenscn-/)
    // Hidden SVG is appended to the document body.
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)

    const svgCountBefore = svgs.length
    unmount()
    // After unmount: style.filter is cleared, the SVG is removed.
    expect(host.style.filter).toBe('')
    expect(document.querySelectorAll('svg').length).toBe(svgCountBefore - 1)
  })
})
