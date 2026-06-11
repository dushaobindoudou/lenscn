import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { GlassSwitch } from '../../../../registry/components/glass-switch/glass-switch'
import { GlassSlider } from '../../../../registry/components/glass-slider/glass-slider'

// Same canvas stub as glass.test.tsx so lenscn's generateLensMap runs.
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

describe('GlassSwitch', () => {
  it('renders with role=switch and aria-checked=false by default', () => {
    const { getByRole } = render(<GlassSwitch />)
    const sw = getByRole('switch')
    expect(sw.getAttribute('aria-checked')).toBe('false')
  })

  it('toggles on click and updates aria-checked', async () => {
    const onChange = vi.fn()
    const { getByRole } = render(<GlassSwitch onCheckedChange={onChange} />)
    const sw = getByRole('switch')
    fireEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    // The component owns the animation; aria-checked reflects the target.
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })

  it('toggles on Space / Enter', () => {
    const onChange = vi.fn()
    const { getByRole } = render(<GlassSwitch onCheckedChange={onChange} />)
    const sw = getByRole('switch')
    fireEvent.keyDown(sw, { key: ' ' })
    expect(onChange).toHaveBeenCalledWith(true)
    fireEvent.keyDown(sw, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('respects controlled checked prop', () => {
    const { getByRole, rerender } = render(<GlassSwitch checked={false} />)
    const sw = getByRole('switch')
    fireEvent.click(sw)
    expect(sw.getAttribute('aria-checked')).toBe('false')
    rerender(<GlassSwitch checked={true} />)
    expect(sw.getAttribute('aria-checked')).toBe('true')
  })
})

describe('GlassSlider', () => {
  it('renders with role=slider and aria-valuenow reflecting default', () => {
    const { getByRole } = render(<GlassSlider defaultValue={0.4} />)
    const sl = getByRole('slider')
    expect(sl.getAttribute('aria-valuemin')).toBe('0')
    expect(sl.getAttribute('aria-valuemax')).toBe('100')
    expect(sl.getAttribute('aria-valuenow')).toBe('40')
  })

  it('arrow keys change the value by step', () => {
    const onChange = vi.fn()
    const { getByRole } = render(<GlassSlider defaultValue={0.4} step={0.1} onValueChange={onChange} />)
    const sl = getByRole('slider')
    fireEvent.keyDown(sl, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(0.5)
    fireEvent.keyDown(sl, { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith(0.4)
  })

  it('clamps to 0..1', () => {
    const onChange = vi.fn()
    const { getByRole } = render(<GlassSlider defaultValue={0.05} step={0.5} onValueChange={onChange} />)
    const sl = getByRole('slider')
    fireEvent.keyDown(sl, { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })
})
