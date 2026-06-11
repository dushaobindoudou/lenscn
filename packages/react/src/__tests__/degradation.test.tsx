import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { Glass } from '../glass'
import { GlassSwitch } from '../../../../registry/components/glass-switch/glass-switch'
import { GlassSlider } from '../../../../registry/components/glass-slider/glass-slider'
import { GlassTabs } from '../../../../registry/components/glass-tabs/glass-tabs'
import { GlassSegmentedControl } from '../../../../registry/components/glass-segmented-control/glass-segmented-control'

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

describe('registry components under prefers-reduced-transparency', () => {
  it('GlassSwitch renders a solid fallback handle and still toggles', () => {
    setMatchMedia((q) => q.includes('reduced-transparency'))
    const onChange = vi.fn()
    const { getByRole, container } = render(<GlassSwitch onCheckedChange={onChange} />)
    expect(container.querySelector('[data-fallback-handle]')).toBeTruthy()
    const sw = getByRole('switch')
    fireEvent.keyDown(sw, { key: ' ' })
    expect(onChange).toHaveBeenCalledWith(true)
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('GlassSlider renders a solid fallback handle and arrows still work', () => {
    setMatchMedia((q) => q.includes('reduced-transparency'))
    const onChange = vi.fn()
    const { getByRole, container } = render(
      <GlassSlider defaultValue={0.4} step={0.1} onValueChange={onChange} />,
    )
    expect(container.querySelector('[data-fallback-handle]')).toBeTruthy()
    fireEvent.keyDown(getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(0.5)
  })

  it('GlassTabs renders a solid highlight and keyboard still works', () => {
    setMatchMedia((q) => q.includes('reduced-transparency'))
    const tabs = [
      { value: 'a', label: 'A', content: 'panel a' },
      { value: 'b', label: 'B', content: 'panel b' },
    ]
    const { container, getAllByRole } = render(<GlassTabs tabs={tabs} />)
    expect(container.querySelector('[data-fallback-handle]')).toBeTruthy()
    const [first] = getAllByRole('tab')
    fireEvent.keyDown(first.parentElement!, { key: 'ArrowRight' })
    expect(getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true')
  })

  it('GlassSegmentedControl renders a solid highlight and keyboard still works', () => {
    setMatchMedia((q) => q.includes('reduced-transparency'))
    const options = [
      { value: 'x', label: 'X' },
      { value: 'y', label: 'Y' },
    ]
    const { container, getAllByRole } = render(<GlassSegmentedControl options={options} />)
    expect(container.querySelector('[data-fallback-handle]')).toBeTruthy()
    fireEvent.keyDown(getAllByRole('tab')[0].parentElement!, { key: 'ArrowRight' })
    expect(getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true')
  })
})

describe('registry components under prefers-reduced-motion', () => {
  it('GlassSwitch handle jumps to the target without easing', () => {
    // Reduced transparency too, so the handle position is observable
    // through the fallback element.
    setMatchMedia(
      (q) => q.includes('reduced-transparency') || q.includes('reduced-motion'),
    )
    const { getByRole, container } = render(<GlassSwitch width={148} height={76} />)
    fireEvent.click(getByRole('switch'))
    const handle = container.querySelector('[data-fallback-handle]') as HTMLElement
    // progress=1 → lensX = 38 + 72 = 110, handle left = 110 - 32 = 78.
    expect(handle.style.left).toBe('78px')
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
