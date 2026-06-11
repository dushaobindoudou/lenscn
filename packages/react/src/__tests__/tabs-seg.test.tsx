import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { GlassSegmentedControl } from '../../../../registry/components/glass-segmented-control/glass-segmented-control'
import { GlassTabs } from '../../../../registry/components/glass-tabs/glass-tabs'

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

describe('GlassSegmentedControl', () => {
  const opts = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
  ]

  it('renders one tab per option and marks the active one aria-selected', () => {
    const { getAllByRole } = render(<GlassSegmentedControl options={opts} defaultValue="b" />)
    const tabs = getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0].getAttribute('aria-selected')).toBe('false')
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs[2].getAttribute('aria-selected')).toBe('false')
  })

  it('arrow keys move the active option', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <GlassSegmentedControl options={opts} defaultValue="a" onValueChange={onChange} />,
    )
    fireEvent.keyDown(getByRole('tablist'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('b')
    fireEvent.keyDown(getByRole('tablist'), { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith('c')
    fireEvent.keyDown(getByRole('tablist'), { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith('a')
    fireEvent.keyDown(getByRole('tablist'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith('c')
  })

  it('clicking a tab selects it', () => {
    const onChange = vi.fn()
    const { getAllByRole } = render(
      <GlassSegmentedControl options={opts} defaultValue="a" onValueChange={onChange} />,
    )
    fireEvent.click(getAllByRole('tab')[2])
    expect(onChange).toHaveBeenLastCalledWith('c')
  })
})

describe('GlassTabs', () => {
  const tabs = [
    { value: 'one', label: 'One', content: <div>panel-one</div> },
    { value: 'two', label: 'Two', content: <div>panel-two</div> },
  ]

  it('shows the active panel and marks the active tab', () => {
    const { getByRole, queryByText } = render(<GlassTabs tabs={tabs} defaultValue="one" />)
    expect(getByRole('tablist')).toBeTruthy()
    expect(queryByText('panel-one')).toBeTruthy()
    expect(queryByText('panel-two')).toBeNull()
  })

  it('arrow keys move the active tab', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <GlassTabs tabs={tabs} defaultValue="one" onValueChange={onChange} />,
    )
    fireEvent.keyDown(getByRole('tablist'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('two')
  })

  it('clicking a tab updates the panel', () => {
    const { getAllByRole, queryByText } = render(<GlassTabs tabs={tabs} defaultValue="one" />)
    fireEvent.click(getAllByRole('tab')[1])
    expect(queryByText('panel-two')).toBeTruthy()
    expect(queryByText('panel-one')).toBeNull()
  })
})
