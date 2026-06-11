import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { Glass } from '../glass'

function setMatchMedia(matches: (query: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
    }),
  })
}

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

afterEach(() => {
  cleanup()
  setMatchMedia(() => false)
})

describe('Glass under prefers-reduced-transparency', () => {
  it('does not attach a filter when reduced-transparency is preferred', async () => {
    setMatchMedia((q) => q.includes('reduced-transparency'))
    const { container } = render(
      <Glass lens={{ width: 68, height: 68, borderRadius: 34 }}>track</Glass>,
    )
    await new Promise((r) => setTimeout(r, 0))
    const host = container.querySelector('div') as HTMLElement
    expect(host.style.filter).toBe('')
    // No SVG appended when degraded.
    const svgs = Array.from(document.querySelectorAll('svg')).filter(
      (svg) => svg.getAttribute('aria-hidden') === 'true',
    )
    expect(svgs.length).toBe(0)
  })
})

describe('Glass under prefers-reduced-motion', () => {
  it('still attaches a filter — motion is reduced but the effect remains', async () => {
    setMatchMedia((q) => q.includes('reduced-motion'))
    const { container } = render(
      <Glass lens={{ width: 68, height: 68, borderRadius: 34 }}>track</Glass>,
    )
    await new Promise((r) => setTimeout(r, 0))
    const host = container.querySelector('div') as HTMLElement
    expect(host.style.filter).toMatch(/url\(#lenscn-/)
  })
})
